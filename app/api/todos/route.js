import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/mongo";
import { verifyIdToken } from "@/app/lib/firebaseAdmin";

async function getAuthUid(req) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "").trim();
  if (!token) return null;
  try {
    const decoded = await verifyIdToken(token);
    return decoded.uid;
  } catch (e) {
    if (e && e.message === "admin-not-configured") {
      console.error(
        "Firebase Admin not configured: set FIREBASE_CLIENT_EMAIL & FIREBASE_PRIVATE_KEY env vars"
      );
      console.error("Env presence check", {
        FIREBASE_CLIENT_EMAIL: !!process.env.FIREBASE_CLIENT_EMAIL,
        FIREBASE_PRIVATE_KEY: !!process.env.FIREBASE_PRIVATE_KEY,
        FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID ? true : false,
      });
    }
    return null;
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

function hasPerm(permissions, needed) {
  const allowed = new Set(["read", "write", "edit", "delete"]);
  const perms = Array.isArray(permissions) ? permissions : [];
  const norm = new Set(
    perms
      .map((p) =>
        String(p || "")
          .toLowerCase()
          .trim()
      )
      .filter((p) => allowed.has(p))
  );
  // read is always implied
  norm.add("read");
  return norm.has(needed);
}

async function ensureSharePermission(
  db,
  viewerDecoded,
  ownerUid,
  category,
  needed
) {
  if (!viewerDecoded || !ownerUid || !category) return false;
  const emailLower = (viewerDecoded.email || "").toLowerCase();
  const share = await db.collection("shares").findOne({
    ownerUid,
    category,
    $or: [{ viewerUid: viewerDecoded.uid }, { viewerEmailLower: emailLower }],
  });
  if (!share) return false;
  return hasPerm(share.permissions || ["read"], needed);
}

export async function GET(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = decoded.uid;
  const emailLower = (decoded.email || "").toLowerCase();
  const { searchParams } = new URL(req.url);
  const owner = (searchParams.get("owner") || "").trim();
  const category = (searchParams.get("category") || "").trim().toLowerCase();
  const db = await getDb();

  // If requesting own todos
  if (!owner || owner === uid) {
    const docs = await db
      .collection("todos")
      .find({ uid })
      .sort({ createdAt: -1 })
      .toArray();
    return NextResponse.json(
      docs.map(({ _id, ...r }) => ({
        id: _id.toString(),
        category: r.category || "general",
        ...r,
      }))
    );
  }

  // Viewing another user's todos: must be shared
  if (!category) {
    return NextResponse.json(
      { error: "category required for shared view" },
      { status: 400 }
    );
  }
  const share = await db.collection("shares").findOne({
    ownerUid: owner,
    category,
    $or: [{ viewerUid: uid }, { viewerEmailLower: emailLower }],
  });
  if (!share) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const docs = await db
    .collection("todos")
    .find({ uid: owner, category })
    .sort({ createdAt: -1 })
    .toArray();
  return NextResponse.json(
    docs.map(({ _id, ...r }) => ({
      id: _id.toString(),
      category: r.category || "general",
      ...r,
    }))
  );
}

export async function POST(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = decoded.uid;
  const body = await req.json();
  const text = (body.text || "").trim();
  let category = (body.category || "general") + "";
  category = category.trim().toLowerCase();
  if (!category) category = "general";
  if (category.length > 32) category = category.slice(0, 32);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  const db = await getDb();
  const now = Date.now();
  // If creating on behalf of another owner via share
  const ownerUid = (body.ownerUid || "").toString().trim();
  const targetUid = ownerUid && ownerUid !== uid ? ownerUid : uid;
  if (targetUid !== uid) {
    const ok = await ensureSharePermission(
      db,
      decoded,
      ownerUid,
      category,
      "write"
    );
    if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const { insertedId } = await db.collection("todos").insertOne({
    uid: targetUid,
    text,
    completed: false,
    createdAt: now,
    category,
  });
  return NextResponse.json({
    id: insertedId.toString(),
    uid: targetUid,
    text,
    completed: false,
    createdAt: now,
    category,
  });
}

export async function PATCH(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = decoded.uid;
  const body = await req.json();
  const { id, text, completed, category } = body;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const db = await getDb();
  const oid = new (await import("mongodb")).ObjectId(id);
  const existing = await db.collection("todos").findOne({ _id: oid });
  if (!existing)
    return NextResponse.json({ error: "not found" }, { status: 404 });

  // Owner editing own todo
  let actingOnUid = uid;
  if (existing.uid !== uid) {
    // Viewer editing owner's todo via share permission
    const ok = await ensureSharePermission(
      db,
      decoded,
      existing.uid,
      existing.category || "general",
      "edit"
    );
    if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
    actingOnUid = existing.uid;
  }

  const filter = { _id: oid, uid: actingOnUid };
  const update = { $set: {} };
  if (typeof text === "string") update.$set.text = text.trim();
  if (typeof completed === "boolean") update.$set.completed = completed;
  if (typeof category === "string") {
    let cat = category.trim().toLowerCase();
    if (!cat) cat = "general";
    if (cat.length > 32) cat = cat.slice(0, 32);
    // If changing category across owner, ensure viewer has edit on new category too
    if (existing.uid !== uid) {
      const ok2 = await ensureSharePermission(
        db,
        decoded,
        existing.uid,
        cat,
        "edit"
      );
      if (!ok2)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    update.$set.category = cat;
  }
  if (Object.keys(update.$set).length === 0)
    return NextResponse.json({ error: "no fields" }, { status: 400 });
  await db.collection("todos").updateOne(filter, update);
  const doc = await db.collection("todos").findOne(filter);
  return NextResponse.json({
    id: doc._id.toString(),
    uid: doc.uid,
    text: doc.text,
    completed: doc.completed,
    createdAt: doc.createdAt,
    category: doc.category || "general",
  });
}

export async function DELETE(req) {
  const decoded = await getAuthDecoded(req);
  if (!decoded)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const uid = decoded.uid;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const clearCompleted = searchParams.get("clearCompleted");
  const category = searchParams.get("category");
  const ownerUid = (searchParams.get("ownerUid") || "").trim();
  const db = await getDb();
  if (clearCompleted === "1") {
    const targetUid = ownerUid && ownerUid !== uid ? ownerUid : uid;
    if (targetUid !== uid) {
      const ok = await ensureSharePermission(
        db,
        decoded,
        targetUid,
        (category || "").trim().toLowerCase(),
        "delete"
      );
      if (!ok)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    await db
      .collection("todos")
      .deleteMany({
        uid: targetUid,
        completed: true,
        ...(category ? { category: category.trim().toLowerCase() } : {}),
      });
    return NextResponse.json({ cleared: true, ownerUid: targetUid });
  }
  if (category) {
    const cat = category.trim().toLowerCase();
    const targetUid = ownerUid && ownerUid !== uid ? ownerUid : uid;
    if (targetUid !== uid) {
      const ok = await ensureSharePermission(
        db,
        decoded,
        targetUid,
        cat,
        "delete"
      );
      if (!ok)
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
    const res = await db
      .collection("todos")
      .deleteMany({ uid: targetUid, category: cat });
    return NextResponse.json({
      clearedCategory: cat,
      deletedCount: res.deletedCount || 0,
    });
  }
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const oid = new (await import("mongodb")).ObjectId(id);
  const existing = await db.collection("todos").findOne({ _id: oid });
  if (!existing)
    return NextResponse.json({ error: "not found" }, { status: 404 });
  if (existing.uid !== uid) {
    const ok = await ensureSharePermission(
      db,
      decoded,
      existing.uid,
      existing.category || "general",
      "delete"
    );
    if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  await db.collection("todos").deleteOne({ _id: oid });
  return NextResponse.json({ id, ownerUid: existing.uid });
}
