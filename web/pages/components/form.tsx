import { ChangeEvent, FormEvent } from 'react';
import { IError } from '../../hooks/use-request';

export default ({
  onSubmit,
  formName,
  fields,
  errors,
}: {
  errors: IError[];
  onSubmit(e: FormEvent<HTMLFormElement>): void;
  formName: string;
  fields: {
    name: string;
    type: string;
    value: string;
    label: string;
    onChange(event: ChangeEvent<HTMLInputElement>): void;
  }[];
}) => {
  return (
    <form onSubmit={onSubmit}>
      <h1>{formName}</h1>
      <div className="form-group">
        {fields.map(({ label, name, ...props }) => (
          <div key={name}>
            <label>{label}</label>
            <input className="form-control" {...props} />
            {errors.filter(({ field }) => field === name).length > 0 && (
              <div className="alert alert-danger">
                <ul>
                  <li>
                    {errors.filter(({ field }) => field === name)[0].message}
                  </li>
                </ul>
              </div>
            )}
          </div>
        ))}

        {errors.filter(({ field }) => !field).length > 0 && (
          <div className="alert alert-danger">
            <ul>
              <li>{errors[0].message}</li>
            </ul>
          </div>
        )}
        <button className="btn btn-primary">{formName}</button>
      </div>
    </form>
  );
};
