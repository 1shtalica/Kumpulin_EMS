import type { Meta, StoryObj } from '@storybook/react';
import { Toggle } from '@/components/ui/toggle';
import { Bold, Italic, Underline } from 'lucide-react';

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof Toggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: <Bold className="h-4 w-4" />,
    'aria-label': 'Toggle bold',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: <Italic className="h-4 w-4" />,
    'aria-label': 'Toggle italic',
  },
};

export const WithText: Story = {
  args: {
    children: (
      <>
        <Italic className="h-4 w-4" />
        Italic
      </>
    ),
    'aria-label': 'Toggle italic',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: <Underline className="h-4 w-4" />,
    'aria-label': 'Toggle underline',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: <Underline className="h-4 w-4" />,
    'aria-label': 'Toggle underline',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: <Bold className="h-4 w-4" />,
    'aria-label': 'Toggle bold',
  },
};
