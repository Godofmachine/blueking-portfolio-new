import LoginClient from "./LoginClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = typeof params.next === "string" ? params.next : "/admin";
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <div className="flex items-center justify-center px-4 py-12">
        <LoginClient nextPath={nextPath} />
      </div>
      <Footer />
    </main>
  );
}
