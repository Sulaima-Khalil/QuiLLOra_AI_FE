
import { Header } from '../shared/Header';
import { theme } from '../../theme/Theme';

export const Account = () => {
  const getInitials = (name) => {
    if (!name) return " ";
    const words = name.split(" ");
    return words.length === 1 ? words[0][0].toUpperCase() : words[0][0].toUpperCase() + words[1][0].toUpperCase();
  };

  return (
    <div style={{
      maxWidth: 450,
      width: '100%',
      background: theme.colors.cardBg,
      border: `2px solid ${theme.colors.border}`,
      padding: theme.spacing.lg,
      borderRadius: theme.radius.md,
      margin: '0 auto'
    }}>
      <Header title="Profile Information" description="Update your photo and personal details..." />

      <div style={{ display: 'flex', gap: theme.spacing.md, paddingTop: theme.spacing.lg }}>
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: theme.colors.accent,
          color: theme.colors.textPrimary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: 24,
        }}>{getInitials("Sulaima Khalil")}</div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <div style={{ display: 'flex', gap: theme.spacing.sm }}>
            <button style={{
              background: theme.colors.bgSecondary,
              borderRadius: theme.radius.sm,
              padding: '8px 16px',
              border: 'none',
              cursor: 'pointer',
            }}>Change Photo</button>
            <button style={{
              background: 'none',
              border: 'none',
              color: theme.colors.accent,
              cursor: 'pointer'
            }}>Remove</button>
          </div>
          <span style={{ fontSize: theme.fontSize.sm }}>JPG, GIF, or PNG. Max size 800K</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: theme.spacing.lg, marginTop: theme.spacing.lg }}>
        <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <label>First Name</label>
          <input value="Sulaima" style={{
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.inputBorder}`,
            background: theme.colors.inputBg,
            color: theme.colors.textPrimary
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <label>Last Name</label>
          <input value="Khalil" style={{
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.inputBorder}`,
            background: theme.colors.inputBg,
            color: theme.colors.textPrimary
          }} />
        </div>
        <div style={{ flex: 1, minWidth: 300, display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <label>Email</label>
          <input value="sulaima@example.com" style={{
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.inputBorder}`,
            background: theme.colors.inputBg,
            color: theme.colors.textPrimary
          }} />
        </div>
      </div>

      <div style={{ marginTop: theme.spacing.lg, display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
        <label>Bio</label>
        <textarea value="Web developer and passionate hardworker to design websites and web applications"
          style={{
            padding: theme.spacing.sm,
            borderRadius: theme.radius.sm,
            border: `1px solid ${theme.colors.inputBorder}`,
            background: theme.colors.inputBg,
            color: theme.colors.textPrimary,
            minHeight: 60,
            resize: 'vertical'
          }} />
      </div>
    </div>
  );
};
