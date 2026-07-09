import type { Meta, StoryObj } from '@storybook/react';
import { MeshGradientBackground } from '@/components/reusable/mesh-gradient-background';

const meta = {
  title: 'Reusable/MeshGradientBackground',
  component: MeshGradientBackground,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MeshGradientBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MeshGradientBackground>
      <div className="bg-white/50 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/20 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Mesh Gradient
        </h1>
        <p className="text-slate-600">
          This background component uses CSS mix-blend modes and animations to create a modern, dynamic mesh gradient effect behind your content.
        </p>
      </div>
    </MeshGradientBackground>
  ),
};
