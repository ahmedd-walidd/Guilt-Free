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
import { categoriesByType, transactionTypeOptions } from '../../src/constants/categories';
import { colours } from '../../src/constants/colours';
import { getErrorMessage } from '../../src/lib/errors';
import { transactionService } from '../../src/services/transactionService';
import { useAuthStore } from '../../src/stores/authStore';
import type { TransactionType } from '../../src/types/money';
import { isValidDateInput, toDateInputValue } from '../../src/utils/dates';

const transactionTypeValues = ['income', 'fixed_cost', 'investment', 'saving', 'guilt_free', 'waste'] as const;

const transactionSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.'),
  amount: z
    .string()
    .trim()
    .min(1, 'Enter an amount.')
    .refine((value) => Number.isFinite(Number(value)), 'Enter a valid amount.')
    .refine((value) => Number(value) > 0, 'Amount must be greater than zero.'),
  transaction_type: z.enum(transactionTypeValues),
  category: z.string().trim().min(1, 'Choose a category.'),
  transaction_date: z.string().trim().refine(isValidDateInput, 'Use YYYY-MM-DD.'),
  notes: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function AddTransactionScreen() {
  const { isLoading, user } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const { control, handleSubmit, formState, watch, setValue } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: '',
      amount: '',
      transaction_type: 'guilt_free',
      category: categoriesByType.guilt_free[0],
      transaction_date: toDateInputValue(),
      notes: '',
    },
  });
  const selectedType = watch('transaction_type');
  const categoryOptions = categoriesByType[selectedType].map((category) => ({ label: category, value: category }));

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  const onSubmit = async (values: TransactionForm) => {
    setFormError(null);

    try {
      await transactionService.createTransaction({
        user_id: user.id,
        title: values.title.trim(),
        amount: Number(values.amount),
        transaction_type: values.transaction_type,
        category: values.category,
        transaction_date: values.transaction_date,
        notes: values.notes?.trim() || null,
      });

      router.back();
    } catch (error) {
      setFormError(getErrorMessage(error, 'Could not add the transaction.'));
    }
  };

  return (
    <Screen>
      <SectionHeader title="Add transaction" subtitle="Record what happened this month." />

      <Card style={styles.formCard}>
        <Controller
          control={control}
          name="title"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Title"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="amount"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Amount"
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
          name="transaction_type"
          render={({ field: { onChange, value }, fieldState }) => (
            <ChoiceChips
              label="Type"
              options={transactionTypeOptions}
              value={value}
              onChange={(nextType: TransactionType) => {
                onChange(nextType);
                setValue('category', categoriesByType[nextType][0], { shouldValidate: true });
              }}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value }, fieldState }) => (
            <ChoiceChips
              label="Category"
              options={categoryOptions}
              value={value}
              onChange={onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="transaction_date"
          render={({ field: { onBlur, onChange, value }, fieldState }) => (
            <Input
              label="Date"
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
          name="notes"
          render={({ field: { onBlur, onChange, value } }) => (
            <Input label="Notes" multiline onBlur={onBlur} onChangeText={onChange} value={value} />
          )}
        />

        {formError ? <Text style={styles.error}>{formError}</Text> : null}

        <Button title="Save transaction" loading={formState.isSubmitting} onPress={handleSubmit(onSubmit)} />
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
