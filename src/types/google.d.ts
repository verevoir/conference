interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string; select_by: string }) => void;
    auto_select?: boolean;
  }): void;
  renderButton(
    parent: HTMLElement,
    options: {
      theme?: 'outline' | 'filled_blue' | 'filled_black';
      size?: 'large' | 'medium' | 'small';
      type?: 'standard' | 'icon';
      width?: number;
    },
  ): void;
  prompt(): void;
  revoke(hint: string, callback?: () => void): void;
  disableAutoSelect(): void;
}

interface Google {
  accounts: {
    id: GoogleAccountsId;
  };
}

interface Window {
  google?: Google;
}
