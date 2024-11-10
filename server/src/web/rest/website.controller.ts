import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LoggingInterceptor } from '../../client/interceptors/logging.interceptor';
import { LearnerService } from '../../service/learner.service';
import { Post as PostMethod } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { LearnerVM } from '../../service/dto/vm/learner.vm';
import { LearnerDTO } from '../../service/dto/learner.dto';
import { HeaderUtil } from '../../client/header-util';
import { ActivationService } from '../../service/activation.service';
import { RequestOtpVm } from '../../service/dto/vm/request-otp.vm';
import path from 'path';
import fs from 'fs';
import * as os from 'os';
import { AuthGuard } from '../../security';
import { SliderDTO } from '../../service/dto/slider.dto';
import { Page, PageRequest } from '../../domain/base/pagination.entity';
import { SliderService } from '../../service/slider.service';
import { BookDTO } from '../../service/dto/book.dto';
import { OrderItemService } from '../../service/order-item.service';
import { CourseDTO } from '../../service/dto/course.dto';
import { CartItemDTO } from '../../service/dto/cart-item.dto';
import { FavoriteService } from '../../service/favorite.service';
import { CartItemService } from '../../service/cart-item.service';
import { BookBorrowRequestService } from '../../service/book-borrow-request.service';
import { CommentService } from '../../service/comment.service';
import { NotificationService } from '../../service/notification.service';
import { OrderService } from '../../service/order.service';
import { FavoriteDTO } from '../../service/dto/favorite.dto';
import { FavoriteToggleVM } from '../../service/dto/vm/favorite-toggle.vm';
import { EntityType } from '../../domain/enumeration/entity-type';
import { BookService } from '../../service/book.service';
import { CourseService } from '../../service/course.service';
import { CourseVideoService } from '../../service/course-video.service';
import { UpdateProgressVM } from '../../service/dto/vm/update-progress.vm';
import { Like } from 'typeorm';
import { AddCartVM } from '../../service/dto/vm/add-cart.vm';
import { BookBorrowRequestDTO } from '../../service/dto/book-borrow-request.dto';
import { BookBorrowRequestStatus } from '../../domain/enumeration/book-borrow-request-status';
import { BookBorrowRequestVM } from '../../service/dto/vm/book-borrow-request.vm';
import { OrderItemDTO } from '../../service/dto/order-item.dto';
import { OrderStatus } from '../../domain/enumeration/order-status';
import { OrderDTO } from '../../service/dto/order.dto';
import { CheckoutVM } from '../../service/dto/vm/checkout.vm';
import { UpdateProfileVM } from '../../service/dto/vm/update-profile.vm';
import { PaymentMethodDTO } from '../../service/dto/payment-method.dto';
import { PaymentMethodService } from '../../service/payment-method.service';
import { EventType } from '../../domain/enumeration/event-type';
import { EventDTO } from '../../service/dto/event.dto';
import { EventService } from '../../service/event.service';
import { EventSubscriptionService } from '../../service/event-subscription.service';
import { EventRegisterVM } from '../../service/dto/vm/event-register.vm';
import { SubscriptionStatus } from '../../domain/enumeration/subscription-status';
import { EventSubscription } from '../../domain/event-subscription.entity';
import { CommentDTO } from '../../service/dto/comment.dto';
import { AddCommentVM } from '../../service/dto/vm/add-comment.vm';
import { Learner } from '../../domain/learner.entity';

@Controller('api')
@UseInterceptors(LoggingInterceptor)
@ApiTags('website')
export class WebsiteController {
  logger = new Logger('WebsiteController');

  constructor(
    private readonly learnerService: LearnerService,
    private readonly activationService: ActivationService,
    private readonly sliderService: SliderService,
    private readonly orderItemService: OrderItemService,
    private readonly orderService: OrderService,
    public readonly favoriteService: FavoriteService,
    public readonly cartItemService: CartItemService,
    public readonly bookBorrowRequestService: BookBorrowRequestService,
    public readonly commentService: CommentService,
    public readonly notificationService: NotificationService,
    public readonly bookService: BookService,
    public readonly courseService: CourseService,
    public readonly courseVideoService: CourseVideoService,
    public readonly paymentMethodService: PaymentMethodService,
    public readonly eventService: EventService,
    public readonly eventSubscriptionService: EventSubscriptionService,
  ) {}

  @PostMethod('/public/activation/request-otp')
  @ApiOperation({ summary: 'Request OTP for activation' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
  })
  async requestOTP(@Req() req: Request, @Body() requestOtpVm: RequestOtpVm): Promise<void> {
    await this.activationService.requestOTP(requestOtpVm);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'Activation', 'OTP');
  }

  @PostMethod('/public/learner/register')
  @ApiOperation({ summary: 'Register learner' })
  @ApiResponse({
    status: 201,
    description: 'The record has been successfully created.',
    type: LearnerDTO,
  })
  async register(@Req() req: Request, @Body() learnerVM: LearnerVM): Promise<LearnerDTO> {
    try {
      // Check OTP
      await this.activationService.checkOTP(learnerVM.email, learnerVM.otp);
      const created = await this.learnerService.register(learnerVM);
      HeaderUtil.addEntityCreatedHeaders(req.res, 'Learner', created.id);
      return created;
    } catch (error) {
      throw error;
    }
  }

  @Get('/uploads/file/download/:fileName')
  async downloadFile(@Param('fileName') fileName: string, @Res() res: Response) {
    try {
      const uploadDir = os.homedir() + '/uploads/asmarya/';
      const fileContent = await fs.promises.readFile(path.join(uploadDir, fileName));

      console.log('fileName', fileName);
      // console.log('fileContent', fileContent);
      console.log('uploadDir', uploadDir);

      if (fileName.endsWith('.png')) {
        res.setHeader('Content-Type', 'image/png');
      } else if (fileName.endsWith('.jpeg') || fileName.endsWith('.jpg')) {
        res.setHeader('Content-Type', 'image/jpeg');
      } else if (fileName.endsWith('.gif')) {
        res.setHeader('Content-Type', 'image/gif');
      } else if (fileName.endsWith('.svg')) {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else if (fileName.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
      } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
        res.setHeader('Content-Type', 'application/msword');
      } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
        res.setHeader('Content-Type', 'application/vnd.ms-excel');
      } else if (fileName.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else {
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      res.end(fileContent);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Get('/public/sliders')
  @ApiOperation({ summary: 'Get sliders' })
  @ApiResponse({
    status: 200,
    description: 'List all records',
    type: SliderDTO,
  })
  async getAllSliders(@Req() req: Request): Promise<SliderDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort);
    const [results, count] = await this.sliderService.findAndCount({
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/public/payment-methods')
  @ApiOperation({ summary: 'Get active payment methods' })
  @ApiResponse({
    status: 200,
    description: 'List of active payment methods',
    type: PaymentMethodDTO,
    isArray: true,
  })
  async getActivePaymentMethods(@Req() req: Request): Promise<PaymentMethodDTO[]> {
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort);
    const [results, count] = await this.paymentMethodService.findAndCount({
      where: { isActive: true }, // Only fetch active payment methods
      skip: +pageRequest.page * pageRequest.size,
      take: +pageRequest.size,
      order: pageRequest.sort.asOrder(),
    });
    HeaderUtil.addPaginationHeaders(req.res, new Page(results, count, pageRequest));
    return results;
  }

  @Get('/my-profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User Profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile found',
  })
  getMyProfile(@Req() req: Request): any {
    const user: any = req.user;
    return this.learnerService.findByFields({ where: { user: { id: user.id } } });
  }

  @Post('/update-my-profile')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update User Profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully.',
    type: LearnerDTO,
  })
  async updateMyProfile(@Req() req: Request, @Body() updateProfileVm: UpdateProfileVM): Promise<LearnerDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    if (!learner) {
      throw new NotFoundException('User not found.');
    }

    // Update the fields based on the input
    learner.firstName = updateProfileVm.firstName || learner.firstName;
    learner.lastName = updateProfileVm.lastName || learner.lastName;
    learner.birthYear = updateProfileVm.birthYear || learner.birthYear;
    learner.email = updateProfileVm.email || learner.email;
    learner.mobileNo = updateProfileVm.mobileNo || learner.mobileNo;
    learner.nationalityCode = updateProfileVm.nationalityCode || learner.nationalityCode;
    learner.city = updateProfileVm.city || learner.city;
    learner.address = updateProfileVm.address || learner.address;

    // Save the updated profile
    const updatedLearner = await this.learnerService.save(learner);

    return updatedLearner;
  }

  @Get('/all-books')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Books' })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved',
    type: BookDTO,
    isArray: true,
  })
  async getAllBooks(
    @Req() req: Request,
    @Query('search') search?: string, // Add search as a query parameter
  ): Promise<BookDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    // Define the search conditions
    let searchCondition = {};
    if (search) {
      searchCondition = {
        where: [
          { title: Like(`%${search}%`) },
          { author: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
          // Add more fields as needed
        ],
      };
    }

    // Fetch books with the search condition
    const [books, _] = await this.bookService.findAndCount(searchCondition);

    for (const book of books) {
      const favorite = await this.favoriteService.findByFields({
        where: { learner: { id: learner.id }, book: { id: book.id } },
      });
      book.isFavorite = !!favorite;
    }

    return books;
  }

  @Get('/store-books')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Books' })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved',
    type: BookDTO,
    // isArray: true,
  })
  async getStoreBooks(
    @Req() req: Request,
    @Query('search') search?: string, // Add search as a query parameter
  ): Promise<BookDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort);

    // Define the search conditions
    let searchCondition = {};
    if (search) {
      searchCondition = {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
        where: [
          { title: Like(`%${search}%`) },
          { author: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
          // Add more fields as needed
        ],
      };
    } else {
      searchCondition = {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      };
    }

    // Fetch books with the search condition
    const [books, _] = await this.bookService.findAndCount(searchCondition);

    for (const book of books) {
      const favorite = await this.favoriteService.findByFields({
        where: { learner: { id: learner.id }, book: { id: book.id } },
      });
      book.isFavorite = !!favorite;
    }
    HeaderUtil.addPaginationHeaders(req.res, new Page(books, _, pageRequest));

    return books;
  }

  @Get('/my-books')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get books ordered by the user' })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved',
    type: BookDTO,
    isArray: true,
  })
  async getMyBooks(@Req() req: Request): Promise<BookDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    const [orderItems, _] = await this.orderItemService.findAndCount({
      where: { order: { learner: learner } },
      relations: ['book'],
    });

    const books = await Promise.all(
      orderItems.map(async orderItem => {
        const book = orderItem.book;

        if (book) {
          book.progressStep = orderItem.progressStep;
          book.progressPercentage = orderItem.progressPercentage;

          const favorite = await this.favoriteService.findByFields({
            where: { learner: { id: learner.id }, book: { id: book.id } },
          });
          book.isFavorite = !!favorite;

          return book;
        }

        return null;
      }),
    );

    return books.filter(book => book !== null);
  }

  @Get('/book/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Book Details' })
  @ApiResponse({
    status: 200,
    description: 'Book details retrieved',
    type: BookDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async getBookDetails(@Req() req: Request, @Param('id') id: number): Promise<BookDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    const book = await this.bookService.findById(id);
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Fetch comments related to the book
    const comments = await this.commentService.findAndCount({ where: { book: { id } } });
    book.comments = comments[0];

    // Calculate overall rating
    book.overallRating = book.comments.length
      ? book.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / book.comments.length
      : 0;

    // Check if the book is a favorite
    const favorite = await this.favoriteService.findByFields({
      where: { learner: { id: learner.id }, book: { id: book.id } },
    });
    book.isFavorite = !!favorite;

    // Retrieve the order item to get progress information
    const orderItem = await this.orderItemService.findByFields({
      where: { order: { learner: { id: learner.id } }, book: { id: book.id } },
      relations: ['order', 'book'],
    });

    if (orderItem) {
      book.progressStep = orderItem.progressStep;
      book.progressPercentage = orderItem.progressPercentage;
    } else {
      book.progressStep = 0; // or null if no progress exists
      book.progressPercentage = 0; // or null if no progress exists
    }

    return book;
  }
  @Get('/all-courses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get courses' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved',
    type: CourseDTO,
    isArray: true,
  })
  async getAllCourses(
    @Req() req: Request,
    @Query('search') search?: string, // Add search as a query parameter
  ): Promise<CourseDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    // Define the search conditions
    let searchCondition = {};
    if (search) {
      searchCondition = {
        where: [
          { title: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
          // Add more fields as needed
        ],
      };
    }

    // Fetch courses with the search condition
    const [courses, _] = await this.courseService.findAndCount(searchCondition);

    for (const course of courses) {
      const favorite = await this.favoriteService.findByFields({
        where: { learner: { id: learner.id }, course: { id: course.id } },
      });
      course.isFavorite = !!favorite;
    }

    return courses;
  }

  @Get('/store-courses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get courses' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved',
    type: CourseDTO,
    isArray: true,
  })
  async getStoreCourses(
    @Req() req: Request,
    @Query('search') search?: string, // Add search as a query parameter
  ): Promise<CourseDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    const pageRequest: PageRequest = new PageRequest(req.query.page, req.query.size, req.query.sort);

    // Define the search conditions
    let searchCondition = {};
    if (search) {
      searchCondition = {
        where: [
          { title: Like(`%${search}%`) },
          { description: Like(`%${search}%`) },
          // Add more fields as needed
        ],
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      };
    } else {
      searchCondition = {
        skip: +pageRequest.page * pageRequest.size,
        take: +pageRequest.size,
        order: pageRequest.sort.asOrder(),
      };
    }

    // Fetch courses with the search condition
    const [courses, _] = await this.courseService.findAndCount(searchCondition);

    for (const course of courses) {
      const favorite = await this.favoriteService.findByFields({
        where: { learner: { id: learner.id }, course: { id: course.id } },
      });
      course.isFavorite = !!favorite;
      const comments = await this.commentService.findAndCount({ where: { course: course.id } });
      course.comments = comments[0];
      course.overallRating = course.comments.length
        ? course.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / course.comments.length
        : 0;
    }
    HeaderUtil.addPaginationHeaders(req.res, new Page(courses, _, pageRequest));

    return courses;
  }

  @Get('/my-courses')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get courses ordered by the user' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved',
    type: CourseDTO,
    isArray: true,
  })
  async getMyCourses(@Req() req: Request): Promise<CourseDTO[]> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    const [orderItems, _] = await this.orderItemService.findAndCount({
      where: { order: { learner: learner } },
      relations: ['course'],
    });

    const courses = await Promise.all(
      orderItems.map(async orderItem => {
        const course = orderItem.course;

        // Ensure course is not null
        if (course) {
          // Set progress information
          course.progressStep = orderItem.progressStep;
          course.progressPercentage = orderItem.progressPercentage;

          // Check if the course is a favorite
          const favorite = await this.favoriteService.findByFields({
            where: { learner: { id: learner.id }, course: { id: course.id } },
          });
          course.isFavorite = !!favorite;
          return course;
        }

        return null;
      }),
    );

    // Filter out any null values that may have resulted from missing courses
    return courses.filter(course => course !== null);
  }

  @Get('/course/:id')
  @ApiOperation({ summary: 'Get Course Details' })
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Course details retrieved',
    type: CourseDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Course not found',
  })
  async getCourseDetails(@Req() req: Request, @Param('id') id: number): Promise<CourseDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    const course = await this.courseService.findById(id);
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const comments = await this.commentService.findAndCount({ where: { course: { id } } });
    course.comments = comments[0];

    const videos = await this.courseVideoService.findAndCount({ where: { course: { id } } });
    course.videos = videos[0];

    course.overallRating = course.comments.length
      ? course.comments.reduce((sum, comment) => sum + (comment.rating || 0), 0) / course.comments.length
      : 0;

    const favorite = await this.favoriteService.findByFields({
      where: { learner: { id: learner.id }, course: { id: course.id } },
    });
    course.isFavorite = !!favorite;

    // Retrieve the order item to get progress information
    const orderItem = await this.orderItemService.findByFields({
      where: { order: { learner: { id: learner.id } }, course: { id: course.id } },
      relations: ['order', 'course'],
    });
    if (orderItem) {
      course.progressStep = orderItem.progressStep;
      course.progressPercentage = orderItem.progressPercentage;
    } else {
      course.progressStep = 0; // or null if no progress exists
      course.progressPercentage = 0; // or null if no progress exists
    }

    return course;
  }

  @Post('/update-progress')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update progress for a book or course' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Order item not found.',
  })
  async updateProgress(@Req() req: Request, @Body() updateProgressVm: UpdateProgressVM): Promise<{ message: string }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    let orderItem;
    let totalItems = 0;

    // Fetch order item based on type and include necessary relations
    if (updateProgressVm.type === EntityType.BOOK) {
      orderItem = await this.orderItemService.findByFields({
        where: { order: { learner: { id: learner.id } }, book: { id: updateProgressVm.id } },
        relations: ['order', 'book'],
      });

      if (orderItem && orderItem.book) {
        totalItems = orderItem.book.pageCount || 0; // Total number of pages
      }
    } else if (updateProgressVm.type === EntityType.COURSE) {
      orderItem = await this.orderItemService.findByFields({
        where: { order: { learner: { id: learner.id } }, course: { id: updateProgressVm.id } },
        relations: ['order', 'course'],
      });

      if (orderItem && orderItem.course) {
        const courseVideos = await this.courseVideoService.findAndCount({ where: { course: { id: updateProgressVm.id } } });
        totalItems = courseVideos[1]; // Total number of videos
      }
    }

    if (!orderItem || totalItems === 0) {
      throw new NotFoundException('Order item not found or no items to calculate progress.');
    }

    // Update progress information
    orderItem.progressStep = updateProgressVm.progressStep;
    orderItem.progressPercentage = Math.min(100, Math.round((updateProgressVm.progressStep / totalItems) * 100));

    // Save the updated order item
    orderItem = await this.orderItemService.save(orderItem);

    return orderItem;
  }

  @Get('/my-cart')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get Cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart found',
    type: CartItemDTO,
    isArray: true,
  })
  async getMyCart(@Req() req: Request): Promise<any> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    const [cartItems, _] = await this.cartItemService.findAndCount({ where: { learner: { id: learner.id } } });

    const books = cartItems.filter(cartItem => cartItem.book !== null).map(cartItem => cartItem.book);
    const courses = cartItems.filter(cartItem => cartItem.course !== null).map(cartItem => cartItem.course);

    // Calculate the total price
    const totalPrice = cartItems.reduce((total, item) => {
      if (item.book) {
        return total + item.book.price;
      } else if (item.course) {
        return total + item.course.price;
      } else {
        return total;
      }
    }, 0);
    //TODO calculate price base on type

    return { books, courses, total: totalPrice };
  }

  @Post('/add-to-cart')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add item to cart' })
  @ApiResponse({
    status: 200,
    description: 'Item added to cart successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found.',
  })
  async addToCart(@Req() req: Request, @Body() addToCartVm: AddCartVM): Promise<CartItemDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    let cartItem;

    // Check if item already in cart
    if (addToCartVm.type === EntityType.BOOK) {
      const book = await this.bookService.findById(addToCartVm.id);
      if (!book) throw new NotFoundException('Book not found.');

      cartItem = await this.cartItemService.findByFields({
        where: { learner: { id: learner.id }, book: { id: addToCartVm.id } },
      });

      if (cartItem) {
        cartItem.quantity += addToCartVm.quantity || 1;
      } else {
        cartItem = new CartItemDTO();
        cartItem.learner = learner;
        cartItem.book = book;
        cartItem.quantity = addToCartVm.quantity || 1;
      }
    } else if (addToCartVm.type === EntityType.COURSE) {
      const course = await this.courseService.findById(addToCartVm.id);
      if (!course) throw new NotFoundException('Course not found.');

      cartItem = await this.cartItemService.findByFields({
        where: { learner: { id: learner.id }, course: { id: addToCartVm.id } },
      });

      if (cartItem) {
        cartItem.quantity += addToCartVm.quantity || 1;
      } else {
        cartItem = new CartItemDTO();
        cartItem.learner = learner;
        cartItem.course = course;
        cartItem.quantity = addToCartVm.quantity || 1;
      }
    }

    // Save or update the cart item
    cartItem = await this.cartItemService.save(cartItem);

    return cartItem;
  }

  @Delete('/remove-from-cart')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiResponse({
    status: 200,
    description: 'Item removed from cart successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Item not found in cart.',
  })
  async removeFromCart(@Req() req: Request, @Body() removeFromCartVm: AddCartVM): Promise<{ message: string }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    let cartItem;

    // Check if item exists in the cart
    if (removeFromCartVm.type === EntityType.BOOK) {
      cartItem = await this.cartItemService.findByFields({
        where: { learner: { id: learner.id }, book: { id: removeFromCartVm.id } },
      });
    } else if (removeFromCartVm.type === EntityType.COURSE) {
      cartItem = await this.cartItemService.findByFields({
        where: { learner: { id: learner.id }, course: { id: removeFromCartVm.id } },
      });
    }

    if (!cartItem) {
      throw new NotFoundException('Item not found in cart.');
    }

    // Remove the item from the cart
    await this.cartItemService.deleteById(cartItem.id);

    return { message: 'Item removed from cart successfully.' };
  }

  @Delete('/clear-my-cart')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Clear all items from the cart' })
  @ApiResponse({
    status: 200,
    description: 'Cart cleared successfully.',
  })
  async clearCart(@Req() req: Request): Promise<{ message: string }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    if (!learner) {
      throw new NotFoundException('User not found.');
    }

    // Clear the cart
    await this.cartItemService.deleteByCondition({ learner: { id: learner.id } });

    return { message: 'Cart cleared successfully.' };
  }

  @Get('/my-favorites')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User Favorites' })
  @ApiResponse({
    status: 200,
    description: 'Favorites found',
    type: FavoriteDTO,
    isArray: true,
  })
  async getMyFavorites(@Req() req: Request): Promise<any> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    const [favorites, _] = await this.favoriteService.findAndCount({ where: { learner: { id: learner.id } } });

    const books = favorites.filter(favorite => favorite.book !== null).map(favorite => favorite.book);
    const courses = favorites.filter(favorite => favorite.course !== null).map(favorite => favorite.course);

    return { books, courses };
  }

  @Post('/toggle-favorite')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Toggle a favorite item' })
  @ApiResponse({
    status: 200,
    description: 'The favorite has been successfully toggled.',
  })
  async toggleFavorite(
    @Req() req: Request,
    @Body() favoriteToggleVM: FavoriteToggleVM,
  ): Promise<{
    isFavorite: boolean;
    type: EntityType;
    id: number;
  }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    // Check if the item is already a favorite
    let existingFavorite;
    if (favoriteToggleVM.type === EntityType.BOOK) {
      existingFavorite = await this.favoriteService.findByFields({
        where: {
          learner: { id: learner.id },
          book: { id: favoriteToggleVM.id },
        },
      });
    } else if (favoriteToggleVM.type === EntityType.COURSE) {
      existingFavorite = await this.favoriteService.findByFields({
        where: {
          learner: { id: learner.id },
          course: { id: favoriteToggleVM.id },
        },
      });
    }

    let isFavorite = false;
    if (existingFavorite) {
      // If the item is already a favorite, remove it
      await this.favoriteService.deleteById(existingFavorite.id);
    } else {
      // If the item is not a favorite, add it
      const favoriteDTO = new FavoriteDTO();
      favoriteDTO.learner = learner;
      if (favoriteToggleVM.type === EntityType.BOOK) {
        favoriteDTO.book = await this.bookService.findById(favoriteToggleVM.id);
      } else if (favoriteToggleVM.type === EntityType.COURSE) {
        favoriteDTO.course = await this.courseService.findById(favoriteToggleVM.id);
      }
      await this.favoriteService.save(favoriteDTO);
      isFavorite = true;
    }

    // Return the status of the item (favorite or not), type of entity and its id
    return { isFavorite, type: favoriteToggleVM.type, id: favoriteToggleVM.id };
  }

  @Get('/my-orders')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User Orders' })
  @ApiResponse({
    status: 200,
    description: 'Orders found',
  })
  async getMyOrders(@Req() req: Request): Promise<any> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
    return this.orderService.findAndCount({ where: { learner: { id: learner.id } } });
  }

  @Post('/checkout')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Checkout cart items' })
  @ApiResponse({
    status: 201,
    description: 'Order created successfully, pending payment.',
  })
  async checkout(@Req() req: Request, @Body() checkoutVm: CheckoutVM): Promise<OrderDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    // Get cart items
    const [cartItems, _] = await this.cartItemService.findAndCount({ where: { learner: { id: learner.id } } });

    if (!cartItems.length) {
      throw new NotFoundException('Cart is empty.');
    }

    // Calculate total price and discount
    const total = cartItems.reduce((acc, item) => {
      const itemPrice = item.book ? item.book.price : item.course ? item.course.price : 0;
      return acc + itemPrice * (item.quantity || 1);
    }, 0);

    const discount = 0; // Apply any discount logic here

    // Create new order
    const order = new OrderDTO();
    order.learner = learner;
    order.orderNo = `ORD-${new Date().getTime()}`;
    order.total = total;
    order.discount = discount;
    order.paymentType = checkoutVm.paymentType;
    order.orderStatus = OrderStatus.PENDING;
    order.notes = checkoutVm.notes;

    // Save order
    const savedOrder = await this.orderService.save(order);

    // Create and save order items
    for (const cartItem of cartItems) {
      const orderItem = new OrderItemDTO();
      orderItem.order = savedOrder;
      orderItem.book = cartItem.book;
      orderItem.course = cartItem.course;
      orderItem.total = (cartItem.book ? cartItem.book.price : cartItem.course ? cartItem.course.price : 0) * (cartItem.quantity || 1);
      orderItem.discount = 0; // Apply any discount logic here
      await this.orderItemService.save(orderItem);
    }

    // Clear the cart after checkout
    await this.cartItemService.deleteByCondition({ learner: { id: learner.id } });

    return savedOrder;
  }

  @Get('/my-book-borrows')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User BookBorrows' })
  @ApiResponse({
    status: 200,
    description: 'Profile BookBorrows',
  })
  getMyBookBorrows(@Req() req: Request): any {
    const user: any = req.user;
    const learner = this.learnerService.findByFields({ where: { user: { id: user.id } } });
    return this.bookBorrowRequestService.findAndCount({ where: { learner: learner } });
  }

  @Post('/request-book-borrow')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request to borrow a book' })
  @ApiResponse({
    status: 201,
    description: 'Book borrow request created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found.',
  })
  async requestBookBorrow(@Req() req: Request, @Body() borrowRequestVm: BookBorrowRequestVM): Promise<BookBorrowRequestDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    const book = await this.bookService.findById(borrowRequestVm.bookId);
    if (!book) throw new NotFoundException('Book not found.');

    const borrowRequest = new BookBorrowRequestDTO();
    borrowRequest.learner = learner;
    borrowRequest.book = book;
    borrowRequest.requestDate = new Date();
    borrowRequest.collectDate = borrowRequestVm.collectDate;
    borrowRequest.returnDate = borrowRequestVm.returnDate;
    borrowRequest.bookBorrowRequestStatus = BookBorrowRequestStatus.PENDING;

    const savedBorrowRequest = await this.bookBorrowRequestService.save(borrowRequest);

    return savedBorrowRequest;
  }

  @Delete('/cancel-book-borrow/:id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Cancel a book borrow request' })
  @ApiResponse({
    status: 200,
    description: 'Book borrow request canceled successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Book borrow request not found.',
  })
  async cancelBookBorrow(@Req() req: Request, @Param('id') id: number): Promise<{ message: string }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    const borrowRequest = await this.bookBorrowRequestService.findByFields({
      where: { learner: { id: learner.id }, id },
    });

    if (!borrowRequest) {
      throw new NotFoundException('Book borrow request not found.');
    }

    if (borrowRequest.bookBorrowRequestStatus !== BookBorrowRequestStatus.PENDING) {
      throw new BadRequestException('Only pending borrow requests can be canceled.');
    }

    // Delete the borrow request
    await this.bookBorrowRequestService.deleteById(borrowRequest.id);

    return { message: 'Book borrow request canceled successfully.' };
  }

  @Get('/my-notifications')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get User Notifications' })
  @ApiResponse({
    status: 200,
    description: 'Notifications found',
  })
  getMyNotifications(@Req() req: Request): any {
    const user: any = req.user;
    return this.notificationService.findAndCount({ where: { userId: user.id } });
  }

  @Post('/public/event/register')
  @ApiOperation({ summary: 'Register for an event' })
  @ApiResponse({
    status: 201,
    description: 'Successfully registered for the event.',
    type: EventRegisterVM,
  })
  async registerForEvent(@Req() req: Request, @Body() eventRegistrationVM: EventRegisterVM): Promise<EventSubscription> {
    const eventSubscription = new EventSubscription();
    eventSubscription.fullName = eventRegistrationVM.fullName;
    eventSubscription.gender = eventRegistrationVM.gender;
    eventSubscription.birthDate = eventRegistrationVM.birthDate.toString();
    eventSubscription.email = eventRegistrationVM.email;
    eventSubscription.mobileNo = eventRegistrationVM.mobileNo;
    eventSubscription.city = eventRegistrationVM.city;
    eventSubscription.nationalityCode = eventRegistrationVM.nationalityCode;
    eventSubscription.subscriberNotes = eventRegistrationVM.subscriberNotes;
    eventSubscription.attachmentFile = eventRegistrationVM.attachmentFile;
    eventSubscription.attachmentFileContentType = eventRegistrationVM.attachmentFileContentType;
    eventSubscription.subscriptionDate = new Date().toISOString();
    eventSubscription.subscriptionStatus = SubscriptionStatus.PENDING;
    eventSubscription.event = await this.eventService.findById(eventRegistrationVM.eventId);

    // Check if the request is made by a logged-in learner
    let learner: Learner;
    if (req.user) {
      const user: any = req.user;
      learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });
      if (learner) {
        eventSubscription.learner = learner;
      }
    } else {
      // If the user is not logged in, check by email or mobile number
      learner = await this.learnerService.findByFields({
        where: [{ email: eventRegistrationVM.email }, { mobileNo: eventRegistrationVM.mobileNo }],
      });

      if (learner) {
        eventSubscription.learner = learner;
      }
    }

    // Check if the learner has already registered for the event
    if (learner) {
      const existingRegistration = await this.eventSubscriptionService.findByFields({
        where: { learner: { id: learner.id }, event: { id: eventRegistrationVM.eventId } },
      });

      if (existingRegistration) {
        throw new BadRequestException('Learner has already registered for this event.');
      }
    }

    const createdSubscription = await this.eventSubscriptionService.save(eventSubscription);
    HeaderUtil.addEntityCreatedHeaders(req.res, 'EventSubscription', createdSubscription.id);
    return createdSubscription;
  }

  @Get('/public/events/active')
  @ApiOperation({ summary: 'Get active events categorized by event type' })
  @ApiResponse({
    status: 200,
    description: 'List of active events categorized by event type',
    type: [EventDTO],
  })
  async getActiveEventsByType(@Req() req: Request): Promise<{ [key in EventType]?: EventDTO[] }> {
    const activeEvents = await this.eventService.findAndCount({ where: { isActive: true } });

    // Categorize events by their eventType
    const categorizedEvents = activeEvents[0].reduce(
      (acc, event) => {
        const eventType = event.eventType;
        if (!acc[eventType]) {
          acc[eventType] = [];
        }
        acc[eventType].push(event);
        return acc;
      },
      {} as { [key in EventType]?: EventDTO[] },
    );

    return categorizedEvents;
  }

  @Get('/public/event/:id')
  @ApiOperation({ summary: 'Get event details by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event details retrieved successfully.',
    type: EventDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found.',
  })
  async getEventById(@Param('id') id: number): Promise<any> {
    // Use `any` to accommodate the new property
    const event = await this.eventService.findById(id);

    if (!event) {
      throw new NotFoundException('Event not found');
    }

    // Use findAndCount to get both the list of subscriptions and the count
    const [, subscriberCount] = await this.eventSubscriptionService.findAndCount({ where: { event: { id } } });

    // Add the subscriber count to the event details
    const eventDTO = { ...event, subscriberCount };

    return eventDTO;
  }

  @Post('/add-comment')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Add a comment to a course or video' })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Entity not found.',
  })
  async addComment(@Req() req: Request, @Body() addCommentVM: AddCommentVM): Promise<CommentDTO> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    let targetEntity;
    if (addCommentVM.entityType === EntityType.COURSE) {
      targetEntity = await this.courseService.findById(addCommentVM.id);
    } else if (addCommentVM.entityType === EntityType.BOOK) {
      targetEntity = await this.bookService.findById(addCommentVM.id);
    }

    if (!targetEntity) {
      throw new NotFoundException(`${addCommentVM.entityType} not found`);
    }

    const commentDTO = new CommentDTO();
    commentDTO.details = addCommentVM.comment;
    commentDTO.rating = addCommentVM.stars;
    commentDTO.learner = learner;

    if (addCommentVM.entityType === EntityType.COURSE) {
      commentDTO.course = targetEntity;
    } else if (addCommentVM.entityType === EntityType.BOOK) {
      commentDTO.book = targetEntity;
    }

    const createdComment = await this.commentService.save(commentDTO);

    return createdComment;
  }

  @Post('/pay-sadad/request-otp')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Request OTP for Sadad payment' })
  @ApiResponse({
    status: 200,
    description: 'OTP requested',
  })
  async requestSadadOtp(
    @Req() req: Request,
    @Body() body: { orderId: number; birthYear: number; mobileNo: string },
  ): Promise<{ orderId: number; sadadReference: string }> {
    const { orderId, birthYear, mobileNo } = body;

    // Call the Sadad API to request OTP
    //const sadadReference = await this.sadadService.requestOtp(orderId, birthYear, mobileNo);
    const sadadReference = '12345678';

    return {
      orderId,
      sadadReference,
    };
  }

  @Post('/pay-sadad/confirm-payment')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Confirm payment with Sadad OTP' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed and order status updated',
  })
  async confirmSadadPayment(
    @Req() req: Request,
    @Body() body: { orderId: number; otp: string; sadadReference: string },
  ): Promise<{ orderId: number; paymentStatus: string }> {
    const { orderId, otp, sadadReference } = body;

    // Confirm payment with Sadad API
    // const { orderId, paymentStatus } = await this.sadadService.confirmPayment(otp, sadadReference);
    const paymentStatus = 'PAYED';

    // Fetch order and update status
    const order = await this.orderService.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    // Update order status and payedAt
    order.orderStatus = OrderStatus.PAYED;
    order.payedAt = new Date();

    // Save updated order
    await this.orderService.save(order);

    return {
      orderId,
      paymentStatus,
    };
  }

  @Get('/my-events')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get registrations categorized by event types' })
  @ApiResponse({
    status: 200,
    description: 'List of event registrations categorized by event type',
    type: Object, // You may define a specific DTO type if needed
  })
  async getLearnerRegistrationsByEventType(@Req() req: Request): Promise<{ [key in EventType]?: EventSubscription[] }> {
    const user: any = req.user;
    const learner = await this.learnerService.findByFields({ where: { user: { id: user.id } } });

    if (!learner) {
      throw new NotFoundException('Learner not found');
    }

    const registrations = await this.eventSubscriptionService.findAndCount({
      where: { learner: { id: learner.id } },
      relations: ['event'],
    });

    // Categorize registrations by their event type
    const categorizedRegistrations = registrations[0].reduce(
      (acc, registration) => {
        const eventType = registration.event.eventType;
        if (!acc[eventType]) {
          acc[eventType] = [];
        }
        acc[eventType].push(registration);
        return acc;
      },
      {} as { [key in EventType]?: EventSubscription[] },
    );

    return categorizedRegistrations;
  }

  @Get('/public/courses')
  @ApiOperation({ summary: 'Get all public courses' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved',
    type: CourseDTO,
    isArray: true,
  })
  async searchCourses(@Query('search') search?: string): Promise<CourseDTO[]> {
    const searchCondition = search ? { where: { title: Like(`%${search}%`) } } : {};
    const [courses, _] = await this.courseService.findAndCount(searchCondition);
    return courses;
  }

  @Get('/public/books')
  @ApiOperation({ summary: 'Get all public books' })
  @ApiResponse({
    status: 200,
    description: 'Books retrieved',
    type: BookDTO,
    isArray: true,
  })
  async searchBooks(@Query('search') search?: string): Promise<BookDTO[]> {
    const searchCondition = search ? { where: { title: Like(`%${search}%`) } } : {};
    const [books, _] = await this.bookService.findAndCount(searchCondition);
    return books;
  }

  @Get('/order/:id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully.',
    type: OrderDTO,
  })
  @ApiResponse({
    status: 404,
    description: 'Order not found',
  })
  async getOrderById(@Param('id') id: number): Promise<OrderDTO> {
    const order = await this.orderService.findById(id);
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }
}
