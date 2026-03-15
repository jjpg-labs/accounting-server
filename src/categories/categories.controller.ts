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
  Req,
  Res,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  async create(
    @Body() createCategoryDto: Prisma.CategoryUncheckedCreateInput,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const category = await this.categoriesService.create(
        req.user.sub,
        createCategoryDto,
      );
      if (!category) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Failed to create category' });
      }
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const categories = await this.categoriesService.findAll(
        accountingBookId,
        req.user.sub,
      );
      res.status(HttpStatus.OK).json(categories);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to fetch categories' });
    }
  }

  @Get(':id')
  async findOne(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const category = await this.categoriesService.findOne(id, req.user.sub);
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
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const category = await this.categoriesService.update(
        id,
        updateCategoryDto,
        req.user.sub,
      );
      if (!category) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'Failed to update category' });
      }
      res.status(HttpStatus.OK).json(category);
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to update category' });
    }
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const result = await this.categoriesService.remove(id, req.user.sub);
      if (!result) {
        return res
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Category not found' });
      }
      res.status(HttpStatus.OK).json({ message: 'Category deleted' });
    } catch {
      res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Failed to delete category' });
    }
  }
}
