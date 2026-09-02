"use client";

import { useCallback, useEffect, useState } from "react";
import type { Order, OrderStatus } from "@/lib/commerce/types";
import type { StaffRosterEntry } from "@/lib/staff/roster";

interface OrdersAssignmentPanelProps {
  businessId: string;
  initialOrders: Order[];
  staff: StaffRosterEntry[];
  currentMembershipId: string;
  isOwnerOrManager: boolean;
}

const STATUS_OPTIONS: { value: OrderStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "ready", label: "Ready" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function staffLabel(entry: StaffRosterEntry, currentMembershipId: string): string {
  const roleLabel = entry.role.charAt(0).toUpperCase() + entry.role.slice(1);
  const phone = entry.phone ?? "no phone on file";
  const you = entry.id === currentMembershipId ? " (you)" : "";
  return `${roleLabel} — ${phone}${you}`;
}

export function OrdersAssignmentPanel({
  businessId,
  initialOrders,
  staff,
  currentMembershipId,
  isOwnerOrManager,
}: OrdersAssignmentPanelProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [assignedFilter, setAssignedFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [initial, setInitial] = useState(true);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ businessId });
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (assignedFilter !== "all") params.set("assignedStaffId", assignedFilter);

      const res = await fetch(`/api/orders?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to load orders (${res.status})`);
      const body = await res.json();
      setOrders(body.orders as Order[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [businessId, statusFilter, assignedFilter]);

  useEffect(() => {
    // Skip the redundant fetch on first mount — server already gave us the
    // unfiltered list via initialOrders.
    if (initial) {
      setInitial(false);
      return;
    }
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, assignedFilter]);

  async function assign(orderId: string, staffId: string | null) {
    setPendingOrderId(orderId);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? `Assign failed (${res.status})`);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? (body.order as Order) : o)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Assign failed");
    } finally {
      setPendingOrderId(null);
    }
  }

  function itemsSummary(order: Order): string {
    return order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ");
  }

  function assignedLabel(order: Order): string {
    if (!order.assigned_staff_id) return "Unassigned";
    const entry = staff.find((s) => s.id === order.assigned_staff_id);
    return entry ? staffLabel(entry, currentMembershipId) : "Assigned (not on current roster)";
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem", fontFamily: "sans-serif" }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <h1 style={{ fontSize: "1.4rem" }}>Orders</h1>
        <a href={`/dashboard/${businessId}`} style={{ fontSize: "0.9rem" }}>
          ← Back to site editor
        </a>
      </header>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <label style={{ fontSize: "0.85rem" }}>
          Status
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "all")}
            style={{ marginLeft: "0.5rem" }}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label style={{ fontSize: "0.85rem" }}>
          Assigned
          <select
            value={assignedFilter}
            onChange={(e) => setAssignedFilter(e.target.value)}
            style={{ marginLeft: "0.5rem" }}
          >
            <option value="all">Everyone</option>
            <option value="unassigned">Unassigned</option>
            {isOwnerOrManager ? (
              staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {staffLabel(s, currentMembershipId)}
                </option>
              ))
            ) : (
              <option value={currentMembershipId}>Assigned to me</option>
            )}
          </select>
        </label>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p style={{ color: "#888" }}>Loading…</p>}
      {!loading && orders.length === 0 && (
        <p style={{ color: "#888" }}>No orders match these filters.</p>
      )}

      {!loading && orders.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "2px solid #ddd" }}>
              <th style={{ padding: "0.5rem" }}>Order</th>
              <th style={{ padding: "0.5rem" }}>Customer</th>
              <th style={{ padding: "0.5rem" }}>Items</th>
              <th style={{ padding: "0.5rem" }}>Total</th>
              <th style={{ padding: "0.5rem" }}>Status</th>
              <th style={{ padding: "0.5rem" }}>Fulfillment</th>
              <th style={{ padding: "0.5rem" }}>Assigned to</th>
              <th style={{ padding: "0.5rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isSelfAssigned = order.assigned_staff_id === currentMembershipId;
              const isPending = pendingOrderId === order.id;

              return (
                <tr key={order.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "0.5rem", fontFamily: "monospace" }}>
                    {order.id.slice(0, 8)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{order.customer_name ?? "—"}</td>
                  <td style={{ padding: "0.5rem" }}>{itemsSummary(order)}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {order.currency} {order.total.toFixed(2)}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{order.status}</td>
                  <td style={{ padding: "0.5rem" }}>{order.fulfillment_type}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {isOwnerOrManager ? (
                      <select
                        value={order.assigned_staff_id ?? ""}
                        disabled={isPending}
                        onChange={(e) => assign(order.id, e.target.value || null)}
                      >
                        <option value="">Unassigned</option>
                        {staff.map((s) => (
                          <option key={s.id} value={s.id}>
                            {staffLabel(s, currentMembershipId)}
                          </option>
                        ))}
                      </select>
                    ) : (
                      assignedLabel(order)
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    {!isOwnerOrManager && (
                      <>
                        {!order.assigned_staff_id && (
                          <button disabled={isPending} onClick={() => assign(order.id, currentMembershipId)}>
                            Claim
                          </button>
                        )}
                        {isSelfAssigned && (
                          <button disabled={isPending} onClick={() => assign(order.id, null)}>
                            Release
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
