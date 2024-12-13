import { Test, TestingModule } from '@nestjs/testing';
import { AccountingBookModule } from '../../accountingBook/accountigBook.module';
import { AccountingBookController } from '../../accountingBook/accountingBook.controller';
import { AccountingBookService } from '../../accountingBook/accountingBook.service';
import { PrismaService } from '../../services/prisma.service';

describe('AccountingBookModule', () => {
	let accountingBookModule: AccountingBookModule;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			imports: [AccountingBookModule],
			controllers: [AccountingBookController],
			providers: [AccountingBookService, PrismaService],
		}).compile();

		accountingBookModule = module.get<AccountingBookModule>(AccountingBookModule);
	});

	it('should be defined', () => {
		expect(accountingBookModule).toBeDefined();
	});
});