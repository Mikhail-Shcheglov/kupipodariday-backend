import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Offer } from './entities/offer.entity';
import { Repository } from 'typeorm';
import { WishesService } from 'src/wishes/wishes.service';
import { User } from 'src/users/entities/user.entity';
import { Errors } from 'src/utils';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepository: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}
  async create(createOfferDto: CreateOfferDto, user: User): Promise<Offer> {
    const { amount, itemId } = createOfferDto;
    const wish = await this.wishesService.findOne(createOfferDto.itemId);

    if (+wish.raised + amount > wish.price || wish.owner.id === user.id) {
      throw new BadRequestException(Errors.WRONG_DATA);
    }

    return this.offerRepository.save({
      ...createOfferDto,
      item: wish,
      user,
    });
  }

  findMany(): Promise<Offer[]> {
    return this.offerRepository.find();
  }

  findOne(id: number): Promise<Offer> {
    return this.offerRepository.findOneBy({ id });
  }

  updateOne(id: number, updateOfferDto: UpdateOfferDto) {
    return this.offerRepository.update({ id }, updateOfferDto);
  }

  removeOne(id: number) {
    return this.offerRepository.delete({ id });
  }
}
