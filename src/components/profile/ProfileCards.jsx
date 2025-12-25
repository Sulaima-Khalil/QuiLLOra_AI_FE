
import { theme } from '../../theme/Theme';

export const ProfileCards = () => {
  const stats = [
    { name:"Articles", count: 45 },
    { name:"Followers", count: 125 },
    { name:"Following", count: 60 },
    { name:"Total Views", count: 35 }
  ];

  return (
    <div style={{
      display:'flex',
      flexWrap: 'wrap',
      gap: theme.spacing.lg,
      justifyContent:'center',
    }}>
      {stats.map((item, index) => (
        <div key={index} style={{
          width: 200,
          height: 100,
          borderRadius: theme.radius.md,
          border: `2px solid ${theme.colors.border}`,
          display:'flex',
          flexDirection:'column',
          alignItems:'center',
          justifyContent:'center',
          gap: theme.spacing.sm,
          // background: theme.colors.bgSecondary,
        }}>
          <h2 style={{ margin: 0 }}>{item.count}</h2>
          <p style={{ margin: 0, color: theme.colors.textSecondary }}>{item.name}</p>
        </div>
      ))}
    </div>
  )
}
