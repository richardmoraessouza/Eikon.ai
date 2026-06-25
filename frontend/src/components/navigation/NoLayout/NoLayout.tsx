import NoLayout from "@/components/navigation/NoLayout/NoLayout";

export default function LayoutSemMenu({ children }: { children: React.ReactNode }) {
  return <NoLayout>{children}</NoLayout>;
}