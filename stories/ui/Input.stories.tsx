import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@/components/ui/input';
import { Search, Mail } from 'lucide-react';

const meta = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    disabled: {
      control: 'boolean',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number'],
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text here...',
    type: 'text',
  },
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithStartIcon: Story = {
  args: {
    placeholder: 'Search...',
    startIcon: <Search className="w-4 h-4" />,
  },
};

export const WithEndIcon: Story = {
  args: {
    placeholder: 'Email address',
    type: 'email',
    endIcon: <Mail className="w-4 h-4" />,
  },
};

export const WithBothIcons: Story = {
  args: {
    placeholder: 'Search email...',
    startIcon: <Search className="w-4 h-4" />,
    endIcon: <Mail className="w-4 h-4" />,
  },
};
