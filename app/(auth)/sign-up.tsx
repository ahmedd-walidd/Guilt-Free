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

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, 'Enter your full name.'),
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

type SignUpForm = z.infer<typeof signUpSchema>;

export default function SignUpScreen() {
  const signUp = useAuthStore((state) => state.signUp);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<SignUpForm>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: SignUpForm) => {
    setFormError(null);
    setNotice(null);

    try {
      const session = await signUp(values.email, values.password, values.fullName);
      if (session) {
        router.replace('/onboarding');
        return;
      }

      setNotice('Account created. If email confirmation is enabled, check your inbox before signing in.');
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not create your account.'));
    }
  };

  return (
    <Screen contentStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.brand}>Guilt-Free</Text>
        <SectionHeader title="Create account" subtitle="Set up a private spending system around your goals." />
      </View>

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="fullName"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Full name"
              autoCapitalize="words"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

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
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}

        <Button title="Create account" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />

        <Link href="/(auth)/sign-in" asChild>
          <Pressable style={styles.linkWrap}>
            <Text style={styles.link}>I already have an account</Text>
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
  notice: {
    color: colours.primaryDark,
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
