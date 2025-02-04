import { Module } from "@nestjs/common";
import { AccountingBookController } from "./accountingBook.controller";
import { AccountingBookService } from "./accountingBook.service";
import { PrismaService } from "../services/prisma.service";

@Module({
	controllers: [AccountingBookController],
	providers: [AccountingBookService, PrismaService],
	exports: [AccountingBookService]
})
export class AccountingBookModule { }