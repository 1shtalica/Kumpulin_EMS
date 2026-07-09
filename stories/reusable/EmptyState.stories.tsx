import type { Meta, StoryObj } from '@storybook/react';
import EmptyState from '@/components/reusable/EmptyState';
import { Search, CalendarX } from 'lucide-react';

const meta = {
  title: 'Reusable/EmptyState',
  component: EmptyState,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'No items found',
    description: 'We could not find any items matching your criteria. Try adjusting your filters or search terms.',
  },
};

export const WithAction: Story = {
  args: {
    title: 'No events joined yet',
    description: 'You have not joined any events. Discover exciting events around you and start joining them today!',
    actionLabel: 'Explore Events',
    actionHref: '/explore',
    icon: <Search className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />,
  },
};

export const CustomIcon: Story = {
  args: {
    title: 'No upcoming schedule',
    description: 'Your calendar is clear. Take a break or find some new events to attend.',
    icon: <CalendarX className="h-10 w-10 text-primary drop-shadow-sm" strokeWidth={1.5} />,
  },
};
