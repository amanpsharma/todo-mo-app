import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";
import { verifyIdToken } from "@/app/lib/firebaseAdmin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

function isPlaceholder(val) {
  return !val || /REPLACE_ME|your_project_id/i.test(val);
}

function ensureAdmin() {
  if (getApps().length) return true;
  const projectId =
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) privateKey = privateKey.replace(/\\n/g, "\n");
  if (isPlaceholder(clientEmail) || isPlaceholder(privateKey)) return false;
  try {
    initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
    return true;
  } catch (e) {
    console.error("Firebase Admin init failed in shares route", e);
    return false;
  }
}

async function getAuthDecoded(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    return await verifyIdToken(token);
  } catch (e) {
    return null;
  }
}

// GET: list shares. Use query ?my=1 to list shares you created, or ?sharedWithMe=1 to list owners who shared with you
export async function GET(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return withCors(
      NextResponse.json({ error: "unauthorized" }, { status: 401 })
    );
  const uid = decoded.uid;
  const { searchParams } = new URL(req.url);
  const my = searchParams.get("my");
  const sharedWithMe = searchParams.get("sharedWithMe");
  const owner = (searchParams.get("owner") || "").trim();
  const category = (searchParams.get("category") || "").trim().toLowerCase();
  const db = await getDb();

  // Permissions lookup for a specific owner/category for this viewer
  if (owner && category) {
    const emailLower = (decoded.email || "").toLowerCase();
    const rec = await db.collection("shares").findOne({
      ownerUid: owner,
      category,
      $or: [{ viewerUid: uid }, { viewerEmailLower: emailLower }],
    });
    if (!rec)
      return withCors(
        NextResponse.json({ error: "not found" }, { status: 404 })
      );
    const { _id, ownerUid, viewerUid, viewerEmailLower, permissions } = rec;
    return withCors(
      NextResponse.json({
        id: _id.toString(),
        ownerUid,
        category,
        permissions:
          Array.isArray(permissions) && permissions.length
            ? permissions
            : ["read"],
      })
    );
  }

  if (my === "1") {
    const list = await db
      .collection("shares")
      .find({ ownerUid: uid })
      .sort({ createdAt: -1 })
      .toArray();
    return withCors(
      NextResponse.json(
        list.map(({ _id, ...r }) => ({ id: _id.toString(), ...r }))
      )
    );
  }

  if (sharedWithMe === "1") {
    const emailLower = (decoded.email || "").toLowerCase();
    const list = await db
      .collection("shares")
      .find({ $or: [{ viewerUid: uid }, { viewerEmailLower: emailLower }] })
      .toArray();
    // Group by owner
    const grouped = {};
    for (const s of list) {
      const key = s.ownerUid;
      if (!grouped[key])
        grouped[key] = {
          ownerUid: s.ownerUid,
          ownerEmail: s.ownerEmail || null,
          ownerName: s.ownerName || null,
          categories: [],
          categoriesMeta: {}, // { [category]: { createdAt } }
        };
      if (!grouped[key].categories.includes(s.category))
        grouped[key].categories.push(s.category);
      if (!grouped[key].categoriesMeta[s.category])
        grouped[key].categoriesMeta[s.category] = { createdAt: s.createdAt };
    }
    // Enrich with display names when Admin is available
    if (ensureAdmin()) {
      const entries = Object.values(grouped);
      await Promise.all(
        entries.map(async (e) => {
          try {
            const u = await getAuth().getUser(e.ownerUid);
            if (!e.ownerEmail && u?.email) e.ownerEmail = u.email;
            if (!e.ownerName) {
              e.ownerName =
                u?.displayName || (u?.email ? u.email.split("@")[0] : null);
            }
          } catch (e) {
            // ignore
          }
        })
      );
    }
    // Fallback: derive name from email if still missing
    for (const e of Object.values(grouped)) {
      if (!e.ownerName && e.ownerEmail)
        e.ownerName = e.ownerEmail.split("@")[0];
    }
    return withCors(NextResponse.json(Object.values(grouped)));
  }

  return withCors(NextResponse.json({ error: "bad request" }, { status: 400 }));
}

// POST: create share { category, viewerEmail, permissions?: string[] }
export async function POST(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return withCors(
      NextResponse.json({ error: "unauthorized" }, { status: 401 })
    );
  const uid = decoded.uid;
  const ownerEmail = decoded.email || null;
  const ownerName =
    decoded.name || (ownerEmail ? ownerEmail.split("@")[0] : null);
  const body = await req.json();
  let category = (body.category || "").toString().trim().toLowerCase();
  const viewerEmail = (body.viewerEmail || "").toString().trim().toLowerCase();
  const rawPerms = Array.isArray(body.permissions)
    ? body.permissions
    : ["read"];
  const permissions = normalizePerms(rawPerms);
  if (!category || !viewerEmail)
    return withCors(
      NextResponse.json({ error: "missing fields" }, { status: 400 })
    );
  if (category.length > 32) category = category.slice(0, 32);
  if (viewerEmail === (ownerEmail || "").toLowerCase())
    return NextResponse.json(
      { error: "cannot share to self" },
      { status: 400 }
    );

  let viewerUid = null;
  if (ensureAdmin()) {
    try {
      const userRec = await getAuth().getUserByEmail(viewerEmail);
      viewerUid = userRec.uid;
    } catch (e) {
      // If not found or admin not configured fully, proceed with email only
    }
  }

  const db = await getDb();
  const existing = await db.collection("shares").findOne({
    ownerUid: uid,
    category,
    $or: [
      ...(viewerUid ? [{ viewerUid }] : []),
      { viewerEmailLower: viewerEmail },
    ],
  });
  if (existing) {
    // If permissions changed, update existing doc
    const changed =
      JSON.stringify(existing.permissions || ["read"]) !==
      JSON.stringify(permissions);
    if (changed) {
      await db
        .collection("shares")
        .updateOne({ _id: existing._id }, { $set: { permissions } });
    }
    return withCors(
      NextResponse.json({ ok: true, id: existing._id.toString() })
    );
  }
  const { insertedId } = await db.collection("shares").insertOne({
    ownerUid: uid,
    ownerEmail,
    ownerName,
    category,
    viewerUid: viewerUid || null,
    viewerEmailLower: viewerEmail,
    permissions,
    createdAt: Date.now(),
  });
  return withCors(NextResponse.json({ ok: true, id: insertedId.toString() }));
}

// DELETE: revoke share { category, viewerEmail }
export async function DELETE(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return withCors(
      NextResponse.json({ error: "unauthorized" }, { status: 401 })
    );
  const uid = decoded.uid;
  const emailLower = (decoded.email || "").toLowerCase();
  const body = await req.json().catch(() => ({}));

  const category = (body.category || "").toString().trim().toLowerCase();
  const viewerEmail = (body.viewerEmail || "").toString().trim().toLowerCase();
  const ownerUidInBody = (body.ownerUid || "").toString().trim();

  if (!category)
    return withCors(
      NextResponse.json({ error: "missing category" }, { status: 400 })
    );

  const db = await getDb();

  // Case 1: Owner revokes a viewer by email
  if (viewerEmail) {
    const res = await db.collection("shares").deleteMany({
      ownerUid: uid,
      category,
      viewerEmailLower: viewerEmail,
    });
    return withCors(
      NextResponse.json({ ok: true, deleted: res.deletedCount || 0 })
    );
  }

  // Case 2: Viewer leaves a shared category from a specific owner
  if (ownerUidInBody) {
    const res = await db.collection("shares").deleteMany({
      ownerUid: ownerUidInBody,
      category,
      $or: [{ viewerUid: uid }, { viewerEmailLower: emailLower }],
    });
    return withCors(
      NextResponse.json({ ok: true, deleted: res.deletedCount || 0 })
    );
  }
  return withCors(NextResponse.json({ error: "bad request" }, { status: 400 }));
  return NextResponse.json({ error: "bad request" }, { status: 400 });

  function withCors(res) {
    try {
      res.headers.set("Access-Control-Allow-Origin", "*");
      res.headers.set(
        "Access-Control-Allow-Methods",
        "GET,POST,PATCH,DELETE,OPTIONS"
      );
      res.headers.set(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type"
      );
      res.headers.set("Access-Control-Max-Age", "86400");
    } catch {}
    return res;
  }
}

function normalizePerms(arr) {
  const allowed = new Set(["read", "write", "edit", "delete"]);
  const out = [];
  (Array.isArray(arr) ? arr : []).forEach((p) => {
    const k = String(p || "")
      .toLowerCase()
      .trim();
    if (allowed.has(k) && !out.includes(k)) out.push(k);
  });
  if (!out.includes("read")) out.unshift("read");
  return out;
}
