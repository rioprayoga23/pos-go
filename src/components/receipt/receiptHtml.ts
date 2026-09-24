import { formatCurrency } from "../../utils/format";
import type { ReceiptData } from "./types";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

export function createReceiptHtml(data: ReceiptData) {
  const items = data.items
    .map(
      (item) => `
        <div class="row">
          <span>${item.quantity}x ${escapeHtml(item.name)}</span>
          <strong>${escapeHtml(formatCurrency(item.amount))}</strong>
        </div>`,
    )
    .join("");
  return `<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          @page { size: 80mm auto; margin: 0; }
          * { box-sizing: border-box; }
          body { margin: 0; color: #191c1e; font-family: Arial, sans-serif; font-size: 12px; }
          main { width: 80mm; padding: 5mm; margin: 0 auto; }
          header, .queue, footer { text-align: center; }
          header { padding-bottom: 12px; }
          header strong { display: block; margin: 8px 0 3px; font-size: 17px; letter-spacing: 1px; }
          header small, .tiny { font-size: 10px; line-height: 1.5; }
          hr { border: 0; border-top: 1px solid #dbe2ea; margin: 10px 0; }
          .meta, .row { display: flex; justify-content: space-between; gap: 10px; }
          .meta-right { text-align: right; }
          .queue { padding: 8px 0; }
          .queue strong { display: block; margin: 3px 0; font-size: 34px; }
          .items, .totals { display: grid; gap: 7px; }
          .row span { overflow-wrap: anywhere; }
          footer { display: grid; gap: 3px; }
        </style>
      </head>
      <body>
        <main>
          <header>
            <strong>KOPI &amp; BOBA CO.</strong>
            <div>Outlet Kemang • POS-01</div>
            <small>Jl. Kemang Raya No. 18, Jaksel</small>
          </header>
          <hr />
          <div class="meta">
            <div>No: <strong>${escapeHtml(data.billNumber)}</strong><br />Kasir: ${escapeHtml(data.cashier)}</div>
            <div class="meta-right">${escapeHtml(data.date)}<br />${escapeHtml(data.time)} WIB</div>
          </div>
          <hr />
          <div class="queue">
            <small>NOMOR ANTREAN</small>
            <strong>${escapeHtml(data.queueNumber)}</strong>
            <div>${data.itemCount} Minuman • ${escapeHtml(data.orderType)}</div>
          </div>
          <hr />
          <section class="items">${items}</section>
          <hr />
          <section class="totals">
            <div class="row"><span>Subtotal</span><strong>${escapeHtml(formatCurrency(data.subtotal))}</strong></div>
          </section>
          <hr />
          <footer>
            <small class="tiny">Simpan tiket ini untuk pengambilan pesanan.</small>
            <small class="tiny">Terima Kasih atas Kunjungan Anda</small>
          </footer>
        </main>
      </body>
    </html>`;
}
