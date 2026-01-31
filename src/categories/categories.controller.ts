import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Body() createCategoryDto: Prisma.CategoryUncheckedCreateInput,
    @Res() res: Response,
  ) {
    try {
      const category = await this.categoriesService.create(createCategoryDto);
      res.status(HttpStatus.CREATED).json(category);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to create category' });
    }
  }

  @Get()
  async findAll(
    @Query('accountingBookId') accountingBookId: number,
    @Res() res: Response,
  ) {
    try {
      const categories = await this.categoriesService.findAll(accountingBookId);
      res.status(HttpStatus.OK).json(categories);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to fetch categories' });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number, @Res() res: Response) {
    try {
      const category = await this.categoriesService.findOne(id);
      if (!category) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Category not found' });
      }
      res.status(HttpStatus.OK).json(category);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to fetch category' });
    }
  }

  @Put(':id')
  async update(
    @Param('id') id: number,
    @Body() updateCategoryDto: Prisma.CategoryUncheckedUpdateInput,
    @Res() res: Response,
  ) {
    try {
      const category = await this.categoriesService.update(
        id,
        updateCategoryDto,
      );
      res.status(HttpStatus.OK).json(category);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to update category' });
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @Res() res: Response) {
    try {
      await this.categoriesService.remove(id);
      res.status(HttpStatus.OK).json({ message: 'Category deleted' });
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to delete category' });
    }
  }
}
