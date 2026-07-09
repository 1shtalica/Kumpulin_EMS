import type { Meta, StoryObj } from '@storybook/react';
import Loader from '@/components/reusable/Loader';

const meta = {
  title: 'Reusable/Loader',
  component: Loader,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <Loader />,
};
