import { Crumb } from './AccountPage';

export default function PaymentsPage() {
  return (
    <div className="narrow">
      <Crumb page="Payment options" />
      <div className="box" style={{ maxWidth: 620 }}>
        <h2 style={{ marginBottom: 8 }}>Payment options</h2>
        <p>Online payments are handled by Razorpay (UPI, debit and credit cards, net banking, wallets). You enter card details inside the Razorpay window at checkout. NexMart never sees or stores your card number.</p>
        <p style={{ marginTop: 8 }}>Cash on delivery is available on every order.</p>
      </div>
    </div>
  );
}
