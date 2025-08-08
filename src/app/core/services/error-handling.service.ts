import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApolloError } from '@apollo/client/core';
import { RequestError } from '@octokit/request-error';
import { GraphQLError } from 'graphql';
import { FormErrorComponent } from '../../shared/error-toasters/form-error/form-error.component';
import { GeneralMessageErrorComponent } from '../../shared/error-toasters/general-message-error/general-message-error.component';
import { LoggingService } from './logging.service';

export const ERRORCODE_NOT_FOUND = 404;

const FILTERABLE = ['node_modules'];

interface RejectionErrorWrapper {
  rejection?: unknown;
}

function hasRejection(error: unknown): error is RejectionErrorWrapper {
  return typeof error === 'object' && error !== null && 'rejection' in error;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService implements ErrorHandler {
  constructor(private snackBar: MatSnackBar, private logger: LoggingService) {}

  handleError(
    error: HttpErrorResponse | Error | RequestError | ApolloError | RejectionErrorWrapper,
    actionCallback?: () => void
  ): void {
    if (hasRejection(error)) {
      error = error.rejection;
    }

    if (error instanceof ApolloError) {
      if (error.graphQLErrors?.length) {
        error.graphQLErrors.forEach((gqlError: GraphQLError) => {
          const isRateLimit = gqlError.message.toLowerCase().includes('rate limit');
          const message = isRateLimit
            ? 'GitHub API rate limit exceeded. Please try again later.'
            : gqlError.message;

          this.logger.error(`[GraphQL error]: ${gqlError.message}`);

          this.snackBar.openFromComponent(GeneralMessageErrorComponent, {
            data: { message },
          });
        });
      } else if (error.networkError) {
        this.handleHttpError(error.networkError as HttpErrorResponse, actionCallback);
      } else {
        this.handleGeneralError(error.message);
      }
      return;
    }

    this.logger.error(error);

    if (error instanceof Error) {
      this.logger.debug('ErrorHandlingService: ', this.cleanStack(error.stack));
    }
    if (error instanceof HttpErrorResponse) {
      this.handleHttpError(error, actionCallback);
    } else if (error.constructor.name === 'RequestError') {
      this.handleHttpError(error as RequestError, actionCallback);
    } else {
      this.handleGeneralError((error as Error).message || JSON.stringify(error));
    }
  }

  private cleanStack(stacktrace: string): string {
    return stacktrace
      .split('\n')
      .filter((line) => !FILTERABLE.some((word) => line.includes(word))) // exclude lines that contain words in FILTERABLE
      .join('\n');
  }

  // Ref: https://developer.github.com/v3/#client-errors
  private handleHttpError(error: HttpErrorResponse | RequestError, actionCallback?: () => void): void {
    // Angular treats 304 Not Modified as an error, we will ignore it.
    if (error.status === 304) {
      return;
    }

    if (!navigator.onLine) {
      this.handleGeneralError('No Internet Connection');
      return;
    }

    switch (error.status) {
      case 500: // Internal Server Error.
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, { data: error });
        break;
      case 422: // Form errors
        this.snackBar.openFromComponent(FormErrorComponent, { data: error });
        break;
      case 400: // Bad request
      case 401: // Unauthorized
      case 404: // Not found
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, { data: error });
        break;
      default:
        this.snackBar.openFromComponent(GeneralMessageErrorComponent, { data: error });
        return;
    }
  }

  private handleGeneralError(error: string): void {
    this.snackBar.openFromComponent(GeneralMessageErrorComponent, { data: { message: error } });
  }
}
