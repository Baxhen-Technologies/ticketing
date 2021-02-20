import axios, { Method } from 'axios';
import { useState } from 'react';

export interface IError {
  message: string;
  field?: string;
}

const useRequest = <IBody, IResponse, IProps = {}>({
  url,
  method,
  body,
  onSuccess,
}: {
  url: string;
  method: Method;
  body: IBody;
  onSuccess?(data: IResponse): any;
}) => {
  const [errors, setErrors] = useState<IError[]>([]);

  const doRequest = async (props?: IProps) => {
    try {
      setErrors([]);

      const response = (await axios({
        method,
        url,
        data: { ...body, ...props },
      })) as {
        data: IResponse;
      };

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      setErrors(error.response.data.errors);
    }
  };
  return { doRequest, errors };
};

export default useRequest;
