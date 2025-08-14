"use client";
import React, { useMemo, useState, useEffect } from "react";
import ConfirmModal from "../ui/ConfirmModal";
import SharePermissionsModal from "./SharePermissionsModal";
// Utils consumed by split components
import SharesHeader from "./SharesHeader";
import ShareForm from "./ShareForm";
import MySharesList from "./MySharesList";
import SharedWithMeList from "./SharedWithMeList";

export default function SharesPanel({
  categories,
  sharedView,
  setSharedView,
  sharedPerms,
  shareCategory,
  setShareCategory,
  shareEmail,
  setShareEmail,
  shareBusy,
  shareMsg,
  onShare,
  onShareMany,
  myShares,
  revokeShare,
  createShare,
  sharedWithMe,
  leaveSharedCategory,
  loadSharedTodos,
  sharedError,
}) {
  // Local UI state
  const [mySharesQuery, setMySharesQuery] = useState("");
  const [mySharesQueryDeb, setMySharesQueryDeb] = useState("");
  const [mySharesLimit, setMySharesLimit] = useState(20);
  const [sharedQuery, setSharedQuery] = useState("");
  const [sharedQueryDeb, setSharedQueryDeb] = useState("");
  const [sharedOwnersLimit, setSharedOwnersLimit] = useState(20);
  const [showAllCats, setShowAllCats] = useState({});
  const [showSharedWithYou, setShowSharedWithYou] = useState(true);
  const [showSharePanel, setShowSharePanel] = useState(true);
  const [confirmRevoke, setConfirmRevoke] = useState(null); // { category, email }
  const [confirmLeave, setConfirmLeave] = useState(null); // { ownerUid, ownerLabel, category }
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [selectedPerms, setSelectedPerms] = useState(["read"]);
  const [savingPermId, setSavingPermId] = useState(null); // share id while updating perms
  const [expandedId, setExpandedId] = useState(null); // mobile: expanded row in "You shared"

  useEffect(() => {
    const t = setTimeout(() => setMySharesQueryDeb(mySharesQuery), 200);
    return () => clearTimeout(t);
  }, [mySharesQuery]);
  useEffect(() => {
    const t = setTimeout(() => setSharedQueryDeb(sharedQuery), 200);
    return () => clearTimeout(t);
  }, [sharedQuery]);
  // Persist show/hide of the entire share panel across reloads
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todo:sharePanelVisible");
      if (saved === "0") setShowSharePanel(false);
    } catch {}
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem(
        "todo:sharePanelVisible",
        showSharePanel ? "1" : "0"
      );
    } catch {}
  }, [showSharePanel]);

  const filteredMyShares = useMemo(() => {
    const q = mySharesQueryDeb.trim().toLowerCase();
    if (!q) return myShares || [];
    return (myShares || []).filter(
      (s) =>
        (s.viewerEmailLower || "").includes(q) ||
        (s.category || "").toLowerCase().includes(q)
    );
  }, [myShares, mySharesQueryDeb]);
  const visibleMyShares = useMemo(
    () => (filteredMyShares || []).slice(0, mySharesLimit),
    [filteredMyShares, mySharesLimit]
  );

  const filteredSharedOwners = useMemo(() => {
    const q = sharedQueryDeb.trim().toLowerCase();
    if (!q) return sharedWithMe || [];
    return (sharedWithMe || []).filter((o) => {
      const name = (
        o.ownerName ||
        o.ownerEmail ||
        o.ownerUid ||
        ""
      ).toLowerCase();
      const cats = (o.categories || []).join(" ").toLowerCase();
      return name.includes(q) || cats.includes(q);
    });
  }, [sharedWithMe, sharedQueryDeb]);
  const visibleSharedOwners = useMemo(
    () => (filteredSharedOwners || []).slice(0, sharedOwnersLimit),
    [filteredSharedOwners, sharedOwnersLimit]
  );

  // Email autocomplete: recent + derived suggestions
  const [recentEmails, setRecentEmails] = useState([]);
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("todo:recentEmails") || "[]"
      );
      if (Array.isArray(saved)) setRecentEmails(saved);
    } catch {}
  }, []);
  const rememberEmail = (email) => {
    try {
      const e = String(email || "")
        .trim()
        .toLowerCase();
      if (!e) return;
      setRecentEmails((prev) => {
        const next = [e, ...prev.filter((x) => x !== e)].slice(0, 50);
        localStorage.setItem("todo:recentEmails", JSON.stringify(next));
        return next;
      });
    } catch {}
  };
  const allEmailCandidates = useMemo(() => {
    const set = new Set();
    recentEmails.forEach((e) => e && set.add(e));
    (myShares || []).forEach((s) => {
      const e = (s.viewerEmailLower || "").trim().toLowerCase();
      if (e) set.add(e);
    });
    return Array.from(set);
  }, [recentEmails, myShares]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailIndex, setEmailIndex] = useState(0);
  const emailListId = "viewer-email-suggestions";
  const emailFiltered = useMemo(() => {
    const q = (shareEmail || "").trim().toLowerCase();
    if (q.length < 3) return [];
    const list = allEmailCandidates.filter((e) => e.includes(q));
    return list.slice(0, 8);
  }, [allEmailCandidates, shareEmail]);
  // Multi-email chips state (data only; actions live in ShareForm)
  const [emails, setEmails] = useState([]);
  useEffect(() => {
    setEmailIndex(0);
  }, [emailFiltered.length]);

  useEffect(() => {
    if (!categories.includes(shareCategory) && categories.length) {
      setShareCategory(categories[0]);
    }
  }, [categories, shareCategory, setShareCategory]);

  return (
    <div className="rounded border border-neutral-200 dark:border-neutral-800 p-3 flex flex-col gap-2">
      <SharesHeader
        showSharePanel={showSharePanel}
        setShowSharePanel={setShowSharePanel}
        sharedView={sharedView}
        setSharedView={setSharedView}
        sharedPerms={sharedPerms}
      />
      {showSharePanel && (
        <>
          <ShareForm
            categories={categories}
            shareCategory={shareCategory}
            setShareCategory={setShareCategory}
            emails={emails}
            setEmails={setEmails}
            shareEmail={shareEmail}
            setShareEmail={setShareEmail}
            emailOpen={emailOpen}
            setEmailOpen={setEmailOpen}
            emailFiltered={emailFiltered}
            emailIndex={emailIndex}
            setEmailIndex={setEmailIndex}
            emailListId={emailListId}
            selectedPerms={selectedPerms}
            setPermModalOpen={setPermModalOpen}
            shareBusy={shareBusy}
            shareMsg={shareMsg}
            onShare={onShare}
            onShareMany={onShareMany}
            rememberEmail={rememberEmail}
          />

          {myShares && myShares.length === 0 && (
            <div className="text-[11px] text-neutral-500 italic border rounded px-3 py-2">
              You haven't shared any categories yet.
            </div>
          )}
          {!!(myShares && myShares.length) && (
            <MySharesList
              items={{ visible: visibleMyShares, filtered: filteredMyShares }}
              expandedId={expandedId}
              setExpandedId={setExpandedId}
              savingPermId={savingPermId}
              setSavingPermId={setSavingPermId}
              createShare={createShare}
              setConfirmRevoke={setConfirmRevoke}
            />
          )}

          {sharedWithMe && sharedWithMe.length === 0 && (
            <div className="text-[11px] text-neutral-500 italic border rounded px-3 py-2">
              Nothing is shared with you yet.
            </div>
          )}
          {!!(sharedWithMe && sharedWithMe.length) && (
            <>
              <SharedWithMeList
                owners={visibleSharedOwners}
                showSharedWithYou={showSharedWithYou}
                setShowSharedWithYou={setShowSharedWithYou}
                showAllCats={showAllCats}
                setShowAllCats={setShowAllCats}
                visibleCount={visibleSharedOwners.length}
                filteredCount={filteredSharedOwners.length}
                sharedQuery={sharedQuery}
                setSharedQuery={setSharedQuery}
                setSharedOwnersLimit={setSharedOwnersLimit}
                loadSharedTodos={loadSharedTodos}
                setConfirmLeave={setConfirmLeave}
              />
              {filteredSharedOwners.length > sharedOwnersLimit && (
                <div className="mt-2 text-center">
                  <button
                    onClick={() => setSharedOwnersLimit((n) => n + 20)}
                    className="px-3 py-1 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-[11px]"
                  >
                    Load more
                  </button>
                </div>
              )}
            </>
          )}
          {sharedError && (
            <div className="text-red-600 mt-1">{String(sharedError)}</div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!confirmRevoke}
        title="Revoke access"
        message={
          confirmRevoke
            ? `Revoke access to category "${confirmRevoke.category}" for ${confirmRevoke.email}?`
            : ""
        }
        confirmLabel="Revoke"
        onCancel={() => setConfirmRevoke(null)}
        onConfirm={async () => {
          const { category, email } = confirmRevoke || {};
          if (!category || !email) return setConfirmRevoke(null);
          await revokeShare(category, email);
          setConfirmRevoke(null);
        }}
      />

      <ConfirmModal
        open={!!confirmLeave}
        title="Leave shared category"
        message={
          confirmLeave
            ? `Leave ${confirmLeave.ownerLabel}'s "${confirmLeave.category}" category? You will lose access.`
            : ""
        }
        confirmLabel="Leave"
        onCancel={() => setConfirmLeave(null)}
        onConfirm={async () => {
          const { ownerUid, category } = confirmLeave || {};
          if (!ownerUid || !category) return setConfirmLeave(null);
          await leaveSharedCategory(ownerUid, category);
          if (
            sharedView &&
            sharedView.ownerUid === ownerUid &&
            sharedView.category === category
          ) {
            setSharedView(null);
          }
          setConfirmLeave(null);
        }}
      />

      <SharePermissionsModal
        open={permModalOpen}
        defaultPermissions={selectedPerms}
        onCancel={() => setPermModalOpen(false)}
        onConfirm={(perms) => {
          setSelectedPerms(perms && perms.length ? perms : ["read"]);
          setPermModalOpen(false);
        }}
      />
    </div>
  );
}
