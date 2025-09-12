import { YLenhThuoc } from '@app/common/types/ylenhthuoc.interface';
import { normalizeYLenhThuocToDose } from './ylenhthuoc.normalizer';
import { Dose } from 'apps/scheduling-service copyy/src/doses/entities/dose.entity';

export function normalizeYLenhThuocListToDoses(
  ylenhList: YLenhThuoc[],
  userId: string,
): Partial<Dose>[] {
  return ylenhList.map((y) => normalizeYLenhThuocToDose(y, userId));
}
