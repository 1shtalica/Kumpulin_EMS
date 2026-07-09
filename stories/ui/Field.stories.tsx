import type { Meta, StoryObj } from '@storybook/react';
import {
  Field,
  FieldLabel,
  FieldTitle,
  FieldDescription,
  FieldError,
  FieldContent,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

const meta = {
  title: 'UI/Field',
  component: Field,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Field className="w-[400px]">
      <FieldLabel>Username</FieldLabel>
      <FieldContent>
        <Input placeholder="Enter your username" />
      </FieldContent>
      <FieldDescription>
        This is your public display name.
      </FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  render: () => (
    <Field className="w-[400px]" data-invalid={true}>
      <FieldLabel>Email</FieldLabel>
      <FieldContent>
        <Input defaultValue="invalid-email" />
      </FieldContent>
      <FieldError errors={[{ message: 'Please enter a valid email address.' }]} />
    </Field>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <Field orientation="horizontal" className="w-[400px] justify-between">
      <div className="flex flex-col">
        <FieldTitle>Marketing Emails</FieldTitle>
        <FieldDescription>
          Receive emails about new products, features, and more.
        </FieldDescription>
      </div>
      <FieldContent>
        {/* Mock toggle or checkbox */}
        <div className="h-6 w-11 rounded-full bg-slate-200" />
      </FieldContent>
    </Field>
  ),
};
