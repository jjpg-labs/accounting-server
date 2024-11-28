import { Module } from "@nestjs/common";
import { AccountingBookController } from "./controllers/accountingBook.controller";
import { AccountingBookService } from "./services/accountingBook.service";
import { PrismaService } from "src/services/prisma.service";

@Module({
	controllers: [AccountingBookController],
	providers: [AccountingBookService, PrismaService],
	exports: [AccountingBookService]
})
export class AccountingBookModule { }