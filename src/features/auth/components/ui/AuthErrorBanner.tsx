import { FormErrorBanner } from '@/shared/components/ui/FormErrorBanner';

export function AuthErrorBanner({ message }: { message: string }) {
  return <FormErrorBanner message={message} />;
}
