export const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
export const CLERK_ENABLED = Boolean(CLERK_PUBLISHABLE_KEY);

export const clerkAppearance = {
  variables: {
    colorPrimary: '#8C3322',
    colorText: '#1C1917',
    colorTextSecondary: '#78716C',
    colorBackground: '#FFFDF9',
    colorInputBackground: '#FAF8F5',
    colorInputText: '#1C1917',
    colorDanger: '#991B1B',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    borderRadius: '0.5rem',
  },
  elements: {
    rootBox: 'w-full',
    cardBox: 'w-full shadow-none border border-[#E7E2D7] rounded-xl',
    card: 'shadow-none',
    headerTitle: 'font-serif text-2xl font-medium',
    formButtonPrimary: 'normal-case text-sm font-medium',
    footer: 'bg-transparent',
  },
};

export const SIGNUP_ROLE_KEY = 'learnflow_signup_role';
