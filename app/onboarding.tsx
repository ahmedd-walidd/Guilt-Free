import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import { z } from 'zod';

import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { InfoTooltip } from '../src/components/InfoTooltip';
import { Input } from '../src/components/Input';
import { LoadingScreen } from '../src/components/LoadingScreen';
import { Screen } from '../src/components/Screen';
import { SectionHeader } from '../src/components/SectionHeader';
import { colours } from '../src/constants/colours';
import { helpText } from '../src/constants/helpText';
import { useTutorialStatus } from '../src/hooks/useTutorialStatus';
import { getErrorMessage } from '../src/lib/errors';
import { upsertProfile } from '../src/services/profileService';
import { useAuthStore } from '../src/stores/authStore';
import type { Profile } from '../src/types/money';

const numericText = (message: string) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)), 'Enter a valid number.')
    .refine((value) => Number(value) >= 0, 'Use zero or a positive number.');

const onboardingSchema = z
  .object({
    monthly_income: numericText('Enter monthly income.'),
    currency: z.string().trim().min(3, 'Enter a currency code.').max(4, 'Use a short currency code.'),
    fixed_costs_percentage: numericText('Enter fixed costs percentage.'),
    investments_percentage: numericText('Enter investments percentage.'),
    savings_percentage: numericText('Enter savings percentage.'),
    guilt_free_percentage: numericText('Enter guilt-free percentage.'),
    buffer_percentage: numericText('Enter buffer percentage.'),
  })
  .refine(
    (values) => {
      const total =
        Number(values.fixed_costs_percentage) +
        Number(values.investments_percentage) +
        Number(values.savings_percentage) +
        Number(values.guilt_free_percentage) +
        Number(values.buffer_percentage);
      return Math.abs(total - 100) < 0.001;
    },
    {
      message: 'Percentages must add up to exactly 100.',
      path: ['buffer_percentage'],
    },
  );

type OnboardingForm = z.infer<typeof onboardingSchema>;

function defaultsFromProfile(profile: Profile | null): OnboardingForm {
  return {
    monthly_income: String(profile?.monthly_income ?? 0),
    currency: profile?.currency ?? 'EGP',
    fixed_costs_percentage: String(profile?.fixed_costs_percentage ?? 50),
    investments_percentage: String(profile?.investments_percentage ?? 10),
    savings_percentage: String(profile?.savings_percentage ?? 15),
    guilt_free_percentage: String(profile?.guilt_free_percentage ?? 20),
    buffer_percentage: String(profile?.buffer_percentage ?? 5),
  };
}

export default function OnboardingScreen() {
  const { isLoading, session, user, profile, setProfile } = useAuthStore();
  const hasCompletedTutorial = useTutorialStatus();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState, reset, watch } = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: defaultsFromProfile(profile),
  });
  const watchedValues = watch();

  useEffect(() => {
    reset(defaultsFromProfile(profile));
  }, [profile, reset]);

  if (isLoading || hasCompletedTutorial === null) {
    return <LoadingScreen />;
  }

  if (!session || !user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  if (!hasCompletedTutorial) {
    return <Redirect href="/tutorial" />;
  }

  const percentageTotal =
    Number(watchedValues.fixed_costs_percentage || 0) +
    Number(watchedValues.investments_percentage || 0) +
    Number(watchedValues.savings_percentage || 0) +
    Number(watchedValues.guilt_free_percentage || 0) +
    Number(watchedValues.buffer_percentage || 0);

  const onSubmit = async (values: OnboardingForm) => {
    setFormError(null);

    try {
      const savedProfile = await upsertProfile({
        id: user.id,
        full_name: profile?.full_name ?? user.user_metadata?.full_name ?? null,
        monthly_income: Number(values.monthly_income),
        currency: values.currency.toUpperCase(),
        fixed_costs_percentage: Number(values.fixed_costs_percentage),
        investments_percentage: Number(values.investments_percentage),
        savings_percentage: Number(values.savings_percentage),
        guilt_free_percentage: Number(values.guilt_free_percentage),
        buffer_percentage: Number(values.buffer_percentage),
        has_completed_onboarding: true,
      });

      setProfile(savedProfile);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not save your money profile.'));
    }
  };

  return (
    <Screen>
      <SectionHeader title="Money profile" subtitle="Create the monthly plan that your dashboard will measure against." />

      <Card style={styles.card}>
        <Controller
          control={control}
          name="monthly_income"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Monthly income"
              labelAccessory={<InfoTooltip title="Monthly income" body={helpText.monthlyIncome} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="currency"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Currency"
              autoCapitalize="characters"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <View style={styles.percentHeader}>
          <Text style={styles.percentTitle}>Allocation percentages</Text>
          <Text style={[styles.percentTotal, Math.abs(percentageTotal - 100) < 0.001 ? styles.goodTotal : styles.badTotal]}>
            {Number.isFinite(percentageTotal) ? percentageTotal : 0}%
          </Text>
        </View>

        <Controller
          control={control}
          name="fixed_costs_percentage"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Fixed costs"
              labelAccessory={<InfoTooltip title="Fixed costs" body={helpText.fixedCosts} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="investments_percentage"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Investments"
              labelAccessory={<InfoTooltip title="Investments" body={helpText.investments} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="savings_percentage"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Savings"
              labelAccessory={<InfoTooltip title="Savings" body={helpText.savings} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="guilt_free_percentage"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Guilt-free"
              labelAccessory={<InfoTooltip title="Guilt-free spending" body={helpText.guiltFree} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="buffer_percentage"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Buffer"
              labelAccessory={<InfoTooltip title="Buffer" body={helpText.buffer} />}
              keyboardType="decimal-pad"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Save money profile" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
  },
  percentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  percentTitle: {
    color: colours.text,
    fontSize: 16,
    fontWeight: '800',
  },
  percentTotal: {
    fontSize: 16,
    fontWeight: '900',
  },
  goodTotal: {
    color: colours.success,
  },
  badTotal: {
    color: colours.danger,
  },
  error: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
