import React from 'react';
import { Box, createStyles, Text } from '@mantine/core';
import { useNuiEvent } from '../../hooks/useNuiEvent';
import { fetchNui } from '../../utils/fetchNui';
import ScaleFade from '../../transitions/ScaleFade';
import type { ProgressbarProps } from '../../typings';

const useStyles = createStyles(() => ({
  wrapper: {
    width: '100%',
    height: '20%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 0,
    position: 'absolute',
  },
  container: {
    width: 420,
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    width: '100%',
    paddingLeft: 2,
    paddingRight: 2,
  },
  label: {
    fontSize: 18,
    fontWeight: 800,
    color: '#e2e8f0',
    letterSpacing: '0.04em',
    textShadow: '0 0 12px rgba(192, 132, 252, 0.5)',
    maxWidth: 260,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  percentage: {
    fontSize: 18,
    fontWeight: 800,
    color: '#c084fc',
    letterSpacing: '0.04em',
    textShadow: '0 0 10px #a855f7',
    minWidth: 52,
    textAlign: 'right',
  },
  track: {
    position: 'relative',
    width: '100%',
    height: 14,
    borderRadius: 3,
    overflow: 'hidden',
    border: '1px solid #333',
    // Hatched empty background — diagonal stripes
    backgroundImage: `repeating-linear-gradient(
      -55deg,
      #2a2a2a 0px,
      #2a2a2a 6px,
      #1a1a1a 6px,
      #1a1a1a 12px
    )`,
  },
  bar: {
    height: '100%',
    borderRadius: 2,
    background: 'linear-gradient(90deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)',
  },
  barTip: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: '0 2px 2px 0',
    background: '#e9d5ff',
  },
}));

const Progressbar: React.FC = () => {
  const { classes } = useStyles();
  const [visible, setVisible] = React.useState(false);
  const [label, setLabel] = React.useState('');
  const [duration, setDuration] = React.useState(0);
  const [progress, setProgress] = React.useState(0);

  const rafRef = React.useRef<number | null>(null);
  const startTimeRef = React.useRef<number | null>(null);

  const stopAnimation = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useNuiEvent('progressCancel', () => {
    stopAnimation();
    setVisible(false);
    setProgress(0);
  });

  useNuiEvent<ProgressbarProps>('progress', (data) => {
    stopAnimation();
    setProgress(0);
    setLabel(data.label);
    setDuration(data.duration);
    setVisible(true);

    const dur = data.duration;
    startTimeRef.current = performance.now();

    const tick = () => {
      if (startTimeRef.current === null) return;
      const elapsed = performance.now() - startTimeRef.current;
      const pct = Math.min((elapsed / dur) * 100, 100);
      setProgress(pct);
      if (pct < 100) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setVisible(false);
        setProgress(0);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  });

  // Glow style applied inline since Mantine createStyles doesn't easily support
  // keyframe animations with box-shadow — add the keyframe to your global CSS:
  //
  //   @keyframes purple-glow-pulse {
  //     0%, 100% { box-shadow: 0 0 8px 2px #a855f7, 0 0 20px 4px rgba(124,58,237,0.5); }
  //     50%       { box-shadow: 0 0 14px 4px #c084fc, 0 0 30px 8px rgba(147,51,234,0.55); }
  //   }

  return (
    <Box className={classes.wrapper}>
      <ScaleFade visible={visible} onExitComplete={() => fetchNui('progressComplete')}>
        <Box className={classes.container}>
          {/* Label + percentage row */}
          <Box className={classes.metaRow}>
            <Text className={classes.label}>{label}</Text>
            <Text className={classes.percentage}>{Math.floor(progress)}%</Text>
          </Box>

          {/* Track */}
          <Box className={classes.track}>
            <Box
              className={classes.bar}
              style={{
                width: `${progress}%`,
                animation: 'purple-glow-pulse 1.8s ease-in-out infinite',
                position: 'relative',
              }}
            >
              {/* Bright leading edge tip */}
              <Box className={classes.barTip} />
            </Box>
          </Box>
        </Box>
      </ScaleFade>
    </Box>
  );
};

export default Progressbar;
