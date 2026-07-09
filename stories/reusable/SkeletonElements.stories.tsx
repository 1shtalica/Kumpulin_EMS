import type { Meta, StoryObj } from '@storybook/react';
import {
  SkeletonExploreHeader,
  SkeletonCard,
  SkeletonEventGrid,
  SkeletonOrganizerEventCard,
  SkeletonOrganizerEvents,
} from '@/components/reusable/SkeletonElements';

const meta = {
  title: 'Reusable/SkeletonElements',
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SkeletonExploreHeader>; // using an arbitrary component for meta

export default meta;

export const ExploreHeader: StoryObj<typeof SkeletonExploreHeader> = {
  render: () => <SkeletonExploreHeader />,
};

export const Card: StoryObj<typeof SkeletonCard> = {
  render: () => (
    <div className="w-full max-w-sm">
      <SkeletonCard />
    </div>
  ),
};

export const EventGrid: StoryObj<typeof SkeletonEventGrid> = {
  render: () => <SkeletonEventGrid />,
};

export const OrganizerEventCardList: StoryObj<typeof SkeletonOrganizerEventCard> = {
  render: () => (
    <div className="w-full max-w-4xl">
      <SkeletonOrganizerEventCard layout="list" />
    </div>
  ),
};

export const OrganizerEventCardGrid: StoryObj<typeof SkeletonOrganizerEventCard> = {
  render: () => (
    <div className="w-full max-w-sm">
      <SkeletonOrganizerEventCard layout="grid" />
    </div>
  ),
};

export const OrganizerEventsGrid: StoryObj<typeof SkeletonOrganizerEvents> = {
  render: () => <SkeletonOrganizerEvents layout="grid" />,
};
