import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Dose } from './entities/dose.entity';
import { DosesService } from './doses.service';

@Resolver(() => Dose)
export class DosesResolver {
  constructor(private readonly dosesService: DosesService) {}

  @Query(() => [Dose], { name: 'dosesByIds' })
  async findDosesByIds(
    @Args('dose_ids', { type: () => [ID!]! }) dose_ids: string[],
  ): Promise<Dose[]> {
    return this.dosesService.findByIds(dose_ids);
  }
}