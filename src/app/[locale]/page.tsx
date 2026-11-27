import { getTranslations } from "next-intl/server";

export default async function Home() {
  const t = await getTranslations("Home");

  return (
    <main className="flex flex-1 items-center justify-center">
      <h1 className="text-heading font-semibold">{t("title")}</h1>
    </main>
  );
}
