import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from './TextField';

const meta: Meta<typeof TextField> = {
  title: 'Components/TextField',
  component: TextField,
  argTypes: {
    validation: { control: 'select', options: ['none', 'error', 'caution', 'success'] },
    disabled: { control: 'boolean' },
    fullWidth: { control: 'boolean' },
    type: { control: 'select', options: ['text', 'email', 'password', 'tel', 'number'] },
  },
  args: {
    label: 'Label',
    fullWidth: true,
    validation: 'none',
  },
  decorators: [(Story) => <div style={{ width: 358, padding: 16 }}><Story /></div>],
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Playground: Story = {
  render: (args) => {
    const [value, setValue] = useState('');
    return <TextField {...args} value={value} onValueChange={setValue} />;
  },
};

export const States: Story = {
  render: () => {
    const [values, setValues] = useState({
      empty: '',
      filled: 'Hello world',
      error: 'bad@',
      success: 'alex@email.com',
      disabled: 'Cannot edit',
    });
    return (
      <div className="flex flex-col gap-wds-24">
        <TextField label="Empty" value={values.empty} onValueChange={v => setValues(p => ({ ...p, empty: v }))} fullWidth />
        <TextField label="Filled" value={values.filled} onValueChange={v => setValues(p => ({ ...p, filled: v }))} fullWidth />
        <TextField label="Error" value={values.error} onValueChange={v => setValues(p => ({ ...p, error: v }))} validation="error" helperText="Please enter a valid email" fullWidth />
        <TextField label="Success" value={values.success} onValueChange={v => setValues(p => ({ ...p, success: v }))} validation="success" helperText="Email verified" fullWidth />
        <TextField label="Disabled" value={values.disabled} disabled fullWidth />
      </div>
    );
  },
};

export const WithIcons: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    return (
      <div className="flex flex-col gap-wds-24">
        <TextField label="Search" value={search} onValueChange={setSearch} leadingIcon="search" fullWidth />
        <TextField label="Email Address" value={email} onValueChange={setEmail} leadingIcon="email-outline" type="email" fullWidth />
        <TextField label="Password" value={password} onValueChange={setPassword} trailingIcon="show" type="password" fullWidth />
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const [v1, setV1] = useState('');
    const [v2, setV2] = useState('promo123');
    const [v3, setV3] = useState('FREEFRYDAY');
    const [v4, setV4] = useState('expired');
    return (
      <div className="flex flex-col gap-wds-24">
        <TextField label="Promo Code" value={v1} onValueChange={setV1} helperText="Enter your promo code" fullWidth />
        <TextField label="Promo Code" value={v2} onValueChange={setV2} helperText="Checking code..." fullWidth />
        <TextField label="Promo Code" value={v3} onValueChange={setV3} validation="success" helperText="Promo code applied!" fullWidth />
        <TextField label="Promo Code" value={v4} onValueChange={setV4} validation="error" helperText="This promo code has expired" fullWidth />
      </div>
    );
  },
};

export const FormExample: Story = {
  render: () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    return (
      <div className="flex flex-col gap-wds-16">
        <p className="font-display text-[20px] font-[800] leading-[24px]">Sign In</p>
        <TextField label="Email Address" value={email} onValueChange={setEmail} type="email" leadingIcon="email-outline" fullWidth />
        <TextField label="Password" value={password} onValueChange={setPassword} type="password" trailingIcon="show" fullWidth />
        <TextField label="Phone Number" value={phone} onValueChange={setPhone} type="tel" leadingIcon="phone-outline" helperText="We'll send a verification code" fullWidth />
      </div>
    );
  },
};

export const SearchField: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    return (
      <TextField
        label="Search City, State, or Zip"
        value={search}
        onValueChange={setSearch}
        leadingIcon="search"
        fullWidth
      />
    );
  },
};
