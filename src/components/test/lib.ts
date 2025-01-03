import { BaseDrawArgs } from '@glideapps/glide-data-grid';

export function prepTextCell(
  args: BaseDrawArgs,
  lastPrep: any,
  overrideColor?: string
): Partial<any> {
  const { ctx, theme } = args;
  const result: Partial<any> = lastPrep ?? {};

  const newFill = overrideColor ?? theme.textDark;
  if (newFill !== result.fillStyle) {
    ctx.fillStyle = newFill;
    result.fillStyle = newFill;
  }
  return result;
}
