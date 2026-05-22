import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text } from 'react-native';
import { z } from 'zod';

import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ChoiceChips } from '../../src/components/ChoiceChips';
import { Input } from '../../src/components/Input';
import { LoadingScreen } from '../../src/components/LoadingScreen';
import { Screen } from '../../src/components/Screen';
import { SectionHeader } from '../../src/components/SectionHeader';
import { colours } from '../../src/constants/colours';
import { getErrorMessage } from '../../src/lib/errors';
import { goalService } from '../../src/services/goalService';
import { useAuthStore } from '../../src/stores/authStore';
import type { GoalPriority } from '../../src/types/money';
import { isValidDateInput } from '../../src/utils/dates';

const priorityOptions: { label: string; value: GoalPriority }[] = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

const numberText = (message: string, allowZero = true) =>
  z
    .string()
    .trim()
    .min(1, message)
    .refine((value) => Number.isFinite(Number(value)), 'Enter a valid number.')
    .refine((value) => (allowZero ? Number(value) >= 0 : Number(value) > 0), allowZero ? 'Use zero or a positive number.' : 'Amount must be greater than zero.');

const goalSchema = z.object({
  name: z.string().trim().min(1, 'Enter a goal name.'),
  target_amount: numberText('Enter a target amount.', false),
  current_amount: numberText('Enter the current amount.'),
  monthly_contribution: numberText('Enter the monthly contribution.'),
  target_date: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || isValidDateInput(value), 'Use YYYY-MM-DD.'),
  priority: z.enum(['low', 'medium', 'high']),
});

type GoalForm = z.infer<typeof goalSchema>;

export default function AddGoalScreen() {
  const { isLoading, user } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState } = useForm<GoalForm>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: '',
      target_amount: '',
      current_amount: '0',
      monthly_contribution: '0',
      target_date: '',
      priority: 'medium',
    },
  });

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const onSubmit = async (values: GoalForm) => {
    setFormError(null);

    try {
      await goalService.createGoal({
        user_id: user.id,
        name: values.name.trim(),
        target_amount: Number(values.target_amount),
        current_amount: Number(values.current_amount),
        monthly_contribution: Number(values.monthly_contribution),
        target_date: values.target_date?.trim() || null,
        priority: values.priority,
      });

      router.back();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not add the goal.'));
    }
  };

  return (
    <Screen>
      <SectionHeader title="Add goal" subtitle="Create a saving target and track progress over time." />

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input label="Name" onBlur={onBlur} onChangeText={onChange} value={value} error={fieldState.error?.message} />
          )}
        />

        <Controller
          control={control}
          name="target_amount"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Target amount"
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
          name="current_amount"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Current amount"
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
          name="monthly_contribution"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Monthly contribution"
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
          name="target_date"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Target date"
              placeholder="YYYY-MM-DD"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="priority"
          render={({ field: { onChange, value }, fieldState }) => (
            <ChoiceChips
              label="Priority"
              options={priorityOptions}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Save goal" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
        <Button title="Cancel" variant="secondary" onPress={() => router.back()} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  formCard: {
    gap: 14,
  },
  error: {
    color: colours.danger,
    fontSize: 14,
    lineHeight: 20,
  },
});
