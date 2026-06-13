import { Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/src/shared/components/ui';
import { AuthShell } from '@/src/features/auth/components/AuthShell';
import { AuthFooter } from '@/src/features/auth/components/AuthFooter';
import { useRegister } from '@/src/features/auth/hooks/useRegister';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
}

export default function RegisterScreen() {
  const { register, loading } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await register(data);
    } catch (err) {
      Alert.alert('Registration Failed', err instanceof Error ? err.message : 'Could not create account');
    }
  };

  return (
    <AuthShell
      variant="compact"
      title="Create account"
      subtitle="Set up your profile in under a minute."
      backHref="/(auth)/login"
      footer={
        <AuthFooter text="Already have an account?" linkText="Sign In" href="/(auth)/login" />
      }
    >
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, value } }) => (
          <Input label="Full name" value={value} onChangeText={onChange} placeholder="Jane Doe" error={errors.name?.message} />
        )}
      />

      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Email"
            value={value}
            onChangeText={onChange}
            keyboardType="email-address"
            autoCapitalize="none"
            textContentType="emailAddress"
            autoComplete="email"
            placeholder="you@example.com"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'Password is required', minLength: { value: 8, message: 'Minimum 8 characters' } }}
        render={({ field: { onChange, value } }) => (
          <Input
            label="Password"
            value={value}
            onChangeText={onChange}
            secureTextEntry
            secureToggle
            textContentType="newPassword"
            autoComplete="password-new"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
          />
        )}
      />

      <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
    </AuthShell>
  );
}
