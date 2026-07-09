import type { Meta, StoryObj } from '@storybook/react';
import { Calendar } from '@/components/ui/calendar';

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['single', 'multiple', 'range'],
    },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    mode: 'single',
    selected: new Date(),
    className: 'rounded-xl border shadow',
  },
};

export const Range: Story = {
  args: {
    mode: 'range',
    selected: {
      from: new Date(new Date().setDate(new Date().getDate() - 2)),
      to: new Date(new Date().setDate(new Date().getDate() + 3)),
    },
    className: 'rounded-xl border shadow',
  },
};
