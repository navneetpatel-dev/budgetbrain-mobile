import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner.component';

export function AuthErrorBanner({ message }: { message: string }) {
  return <FormErrorBanner message={message} />;
}
