import { useNuiEvent } from '../../hooks/useNuiEvent';
import { toast, Toaster } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Box, Center, createStyles, Group, keyframes, RingProgress, Stack, Text, ThemeIcon } from '@mantine/core';
import React, { useState } from 'react';
import tinycolor from 'tinycolor2';
import type { NotificationProps } from '../../typings';
import MarkdownComponents from '../../config/MarkdownComponents';
import LibIcon from '../../components/LibIcon';

const useStyles = createStyles((theme) => ({
  container: {
    width: 300,
    height: 'fit-content',
    backgroundColor: 'transparent',
    color: '#e8e8f0',
    padding: '10px 16px',
    borderRadius: 6,
    fontFamily: 'Roboto',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontWeight: 600,
    lineHeight: 'normal',
    fontSize: 14,
    color: '#f0f0f8',
    letterSpacing: '0.01em',
  },
  description: {
    fontSize: 13,
    color: 'rgba(200, 200, 220, 0.75)',
    fontFamily: 'Roboto',
    lineHeight: 'normal',
  },
  descriptionOnly: {
    fontSize: 14,
    color: 'rgba(200, 200, 220, 0.75)',
    fontFamily: 'Roboto',
    lineHeight: 'normal',
  },
}));

const createAnimation = (from: string, to: string, visible: boolean) => keyframes({
  from: {
    opacity: visible ? 0 : 1,
    transform: `translate${from}`,
  },
  to: {
    opacity: visible ? 1 : 0,
    transform: `translate${to}`,
  },
});

const getAnimation = (visible: boolean, position: string) => {
  const animationOptions = visible ? '0.2s ease-out forwards' : '0.4s ease-in forwards'
  let animation: { from: string; to: string };

  if (visible) {
    animation = position.includes('bottom') ? { from: 'Y(30px)', to: 'Y(0px)' } : { from: 'Y(-30px)', to:'Y(0px)' };
  } else {
    if (position.includes('right')) {
      animation = { from: 'X(0px)', to: 'X(100%)' }
    } else if (position.includes('left')) {
      animation = { from: 'X(0px)', to: 'X(-100%)' };
    } else if (position === 'top-center') {
      animation = { from: 'Y(0px)', to: 'Y(-100%)' };
    } else if (position === 'bottom-center') {
      animation = { from: 'Y(0px)', to: 'Y(100%)' };
    } else {
      animation = { from: 'X(0px)', to: 'X(100%)' };
    }
  }

  return `${createAnimation(animation.from, animation.to, visible)} ${animationOptions}`
};

const durationCircle = keyframes({
  '0%': { strokeDasharray: `0, ${15.1 * 2 * Math.PI}` },
  '100%': { strokeDasharray: `${15.1 * 2 * Math.PI}, 0` },
});

const Notifications: React.FC = () => {
  const { classes } = useStyles();
  const [toastKey, setToastKey] = useState(0);

  useNuiEvent<NotificationProps>('notify', (data) => {
    if (!data.title && !data.description) return;

    const toastId = data.id?.toString();
    const duration = data.duration || 3000;

    let iconColor: string;
    let position = data.position || 'top-right';

    data.showDuration = data.showDuration !== undefined ? data.showDuration : true;

    if (toastId) setToastKey(prevKey => prevKey + 1);

    // Backwards compat with old notifications
    switch (position) {
      case 'top':
        position = 'top-center';
        break;
      case 'bottom':
        position = 'bottom-center';
        break;
    }

    if (!data.icon) {
      switch (data.type) {
        case 'error':
          data.icon = 'circle-xmark';
          break;
        case 'success':
          data.icon = 'circle-check';
          break;
        case 'warning':
          data.icon = 'circle-exclamation';
          break;
        default:
          data.icon = 'circle-info';
          break;
      }
    }

    if (!data.iconColor) {
      switch (data.type) {
        case 'error':
          iconColor = 'red.6';
          break;
        case 'success':
          iconColor = 'teal.6';
          break;
        case 'warning':
          iconColor = 'yellow.6';
          break;
        default:
          iconColor = 'violet.6';
          break;
      }
    } else {
      iconColor = tinycolor(data.iconColor).toRgbString();
    }

    // Resolve the actual CSS color string for borders/glows
    const resolvedColor = tinycolor(iconColor.includes('.') ? (() => {
      const [hue, shade] = iconColor.split('.');
      const colorMap: Record<string, Record<string, string>> = {
        red: { 6: '#fa5252' },
        teal: { 6: '#12b886' },
        yellow: { 6: '#fab005' },
        blue: { 6: '#228be6' },
        violet: { 6: '#7c3aed' },
      };
      return colorMap[hue]?.[shade] ?? '#7c3aed';
    })() : iconColor).toRgbString();

    toast.custom(
      (t) => (
        <Box
          sx={{
            animation: getAnimation(t.visible, position),
            ...data.style,
            backgroundColor: tinycolor(resolvedColor).setAlpha(0.13).toRgbString(),
            border: 'none',
            boxShadow: `0 4px 24px rgba(0,0,0,0.6)`,
          }}
          className={`${classes.container}`}
        >
          {/* Corner brackets */}
          {(['topLeft', 'topRight', 'bottomLeft', 'bottomRight'] as const).map((corner) => {
            const isTop = corner.includes('top');
            const isLeft = corner.includes('Left');
            const size = 12;
            const thickness = 2;
            return (
              <Box
                key={corner}
                sx={{
                  position: 'absolute',
                  width: size,
                  height: size,
                  top: isTop ? 0 : undefined,
                  bottom: isTop ? undefined : 0,
                  left: isLeft ? 0 : undefined,
                  right: isLeft ? undefined : 0,
                  borderTop: isTop ? `${thickness}px solid ${tinycolor(resolvedColor).setAlpha(0.9).toRgbString()}` : 'none',
                  borderBottom: !isTop ? `${thickness}px solid ${tinycolor(resolvedColor).setAlpha(0.9).toRgbString()}` : 'none',
                  borderLeft: isLeft ? `${thickness}px solid ${tinycolor(resolvedColor).setAlpha(0.9).toRgbString()}` : 'none',
                  borderRight: !isLeft ? `${thickness}px solid ${tinycolor(resolvedColor).setAlpha(0.9).toRgbString()}` : 'none',
                  borderTopLeftRadius: corner === 'topLeft' ? 6 : 0,
                  borderTopRightRadius: corner === 'topRight' ? 6 : 0,
                  borderBottomLeftRadius: corner === 'bottomLeft' ? 6 : 0,
                  borderBottomRightRadius: corner === 'bottomRight' ? 6 : 0,
                  filter: `drop-shadow(0 0 4px ${tinycolor(resolvedColor).setAlpha(0.8).toRgbString()})`,
                  pointerEvents: 'none',
                }}
              />
            );
          })}
          <Stack spacing={2}>
            {data.title && <Text className={classes.title}>{data.title}</Text>}
            {data.description && (
              <ReactMarkdown
                components={MarkdownComponents}
                className={`${!data.title ? classes.descriptionOnly : classes.description} description`}
              >
                {data.description}
              </ReactMarkdown>
            )}
          </Stack>
        </Box>
      ),
      {
        id: toastId,
        duration: duration,
        position: position,
      }
    );
  });

  return <Toaster />;
};

export default Notifications;
