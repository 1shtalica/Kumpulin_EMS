import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@/components/ui/button';

const meta = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'destructive',
        'outline',
        'secondary',
        'ghost',
        'link',
        'brand',
        'glass',
        'light',
        'rtpintar',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'icon', 'icon-sm', 'icon-lg', 'xl'],
    },
    hoverEffect: {
      control: 'select',
      options: ['none', 'grow', 'shrink', 'ring', 'lighten', 'darken', 'hover_up'],
    },
    asChild: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'default',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
};

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
};

export const Brand: Story = {
  args: {
    children: 'Brand Button',
    variant: 'brand',
  },
};

export const Glass: Story = {
  args: {
    children: 'Glass Button',
    variant: 'glass',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  }
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="default">Default</Button>
      <Button {...args} size="lg">Large</Button>
      <Button {...args} size="xl">Extra Large</Button>
    </div>
  ),
  args: {
    variant: 'default',
  },
};

export const HoverEffects: Story = {
  render: (args) => (
    <div className="flex items-center gap-4 flex-wrap max-w-2xl">
      <Button {...args} hoverEffect="grow">Grow</Button>
      <Button {...args} hoverEffect="shrink">Shrink</Button>
      <Button {...args} hoverEffect="ring">Ring</Button>
      <Button {...args} hoverEffect="hover_up">Hover Up</Button>
    </div>
  ),
  args: {
    variant: 'default',
  },
};
