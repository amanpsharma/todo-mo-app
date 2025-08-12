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
  const uid = await getAuthUid(req);
  if (!uid)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const text = (body.text || "").trim();
  let category = (body.category || "general") + "";
  category = category.trim().toLowerCase();
  if (!category) category = "general";
  if (category.length > 32) category = category.slice(0, 32);
  if (!text) return NextResponse.json({ error: "empty" }, { status: 400 });
  const db = await getDb();
  const now = Date.now();
  const { insertedId } = await db.collection("todos").insertOne({
    uid,
    text,
    completed: false,
    createdAt: now,
    category,
  });
  return NextResponse.json({
    id: insertedId.toString(),
    uid,
    text,
    completed: false,
    createdAt: now,
    category,
  });
}

export async function PATCH(req) {
  const uid = await getAuthUid(req);
  if (!uid)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json();
  const { id, text, completed, category } = body;
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  const db = await getDb();
  const filter = { _id: new (await import("mongodb")).ObjectId(id), uid };
  const update = { $set: {} };
  if (typeof text === "string") update.$set.text = text.trim();
  if (typeof completed === "boolean") update.$set.completed = completed;
  if (typeof category === "string") {
    let cat = category.trim().toLowerCase();
    if (!cat) cat = "general";
    if (cat.length > 32) cat = cat.slice(0, 32);
    update.$set.category = cat;
  }
  if (Object.keys(update.$set).length === 0)
    return NextResponse.json({ error: "no fields" }, { status: 400 });
  await db.collection("todos").updateOne(filter, update);
  const doc = await db.collection("todos").findOne(filter);
  return NextResponse.json({
    id: doc._id.toString(),
    uid,
    text: doc.text,
    completed: doc.completed,
    createdAt: doc.createdAt,
    category: doc.category || "general",
  });
}

export async function DELETE(req) {
  const uid = await getAuthUid(req);
  if (!uid)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const clearCompleted = searchParams.get("clearCompleted");
  const category = searchParams.get("category");
  const db = await getDb();
  if (clearCompleted === "1") {
    await db.collection("todos").deleteMany({ uid, completed: true });
    return NextResponse.json({ cleared: true });
  }
  if (category) {
    const cat = category.trim().toLowerCase();
    const res = await db.collection("todos").deleteMany({ uid, category: cat });
    return NextResponse.json({
      clearedCategory: cat,
      deletedCount: res.deletedCount || 0,
    });
  }
  if (!id) return NextResponse.json({ error: "missing id" }, { status: 400 });
  await db
    .collection("todos")
    .deleteOne({ _id: new (await import("mongodb")).ObjectId(id), uid });
  return NextResponse.json({ id });
}
