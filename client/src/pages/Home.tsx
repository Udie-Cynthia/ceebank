import { Link } from "react-router-dom";
import QuickActions from "../components/QuickActions";

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="grid md:grid-cols-2 gap-8 items-center py-10">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Banking that feels effortless.
          </h1>
          <p className="mt-3 text-gray-600">
            Send money, buy airtime, pay bills, create virtual cards—fast and secure.
          </p>
          <div className="mt-5 flex gap-3">
            <Link to="/register" className="px-4 py-2 rounded-md bg-black text-white">
              Get started
            </Link>
            <Link to="/about" className="px-4 py-2 rounded-md border">
              Learn more
            </Link>
          </div>
        </div>
        <div className="border rounded-xl p-6">
          <QuickActions compact />
        </div>
      </section>
    </main>
  );
}
