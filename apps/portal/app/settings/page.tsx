import { PageHeader } from "@/app/_components/product-shell/PageHeader";
import { ProductPage } from "@/app/_components/product-shell/ProductPage";
import { SettingsSections } from "./_components/SettingsSections";

export default function SettingsPage() {
  return (
    <ProductPage>
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage account identity, firm details, notifications, access, and usage preferences."
      />
      <SettingsSections />
    </ProductPage>
  );
}
