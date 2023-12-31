import { ErrorCard } from "@/components/ui/error-card";
import { Shell } from "@/components/shell";

export default function PageNotFound() {
  return (
    <Shell variant="centered" className="mt-0 h-screen">
      <ErrorCard
        title="Page not found"
        description="The page you are looking for does not exist"
        retryLink="/"
        retryLinkText="Go to Home"
      />
    </Shell>
  );
}
