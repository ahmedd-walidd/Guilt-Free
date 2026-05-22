import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Input } from '../../src/components/Input';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { getErrorMessage } from '../../src/lib/errors';
import { useAuthStore } from '../../src/stores/authStore';

const signInSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type SignInForm = z.infer<typeof signInSchema>;

export default function SignInScreen() {
  const signIn = useAuthStore((state) => state.signIn);
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<SignInForm>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignInForm) => {
    setFormError(null);

    try {
      await signIn(values.email, values.password);
      router.replace('/');
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not sign in with those details.'));
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.brand}>Guilt-Free</Text>
        <SectionHeader
          title="Sign in"
          subtitle="Use your own numbers to make cleaner spending decisions."
        />
      </View>

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="email"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Email"
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="password"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Password"
              autoCapitalize="none"
              secureTextEntry
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Sign in" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />

        <Link href="/(auth)/sign-up" asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>
        </Link>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  hero: {
    gap: 14,
  },
  brand: {
    color: colours.primaryDark,
    fontSize: 18,
    fontWeight: '900',
  },
  formCard: {
    gap: 14,
  },
  error: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
  linkWrap: {
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  link: {
    color: colours.primaryDark,
    fontWeight: '800',
  },
});
