import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewQueryDto } from './dto/review-query.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('reviews')
export class ReviewController {
    constructor(private service: ReviewService) { }

    @Get()
    list(@Query() query: ReviewQueryDto) {
        return this.service.findAll(query);
    }

    @Get(':id')
    detail(@Param('id') id: string) {
        return this.service.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateReviewDto) {
        return this.service.create(dto);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.service.delete(id);
    }
}

