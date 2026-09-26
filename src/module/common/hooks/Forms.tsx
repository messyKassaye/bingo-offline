import { Button, Input, Select, Upload } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { InboxOutlined } from '@ant-design/icons';
import { IFormElement } from '../../../models/IFormElement';

const returnInput = (input: IFormElement) => {
  return (
    <Input
      type={input.type}
      defaultValue={input?.value}
      value={input?.value}
      placeholder={input.placeholder}
      name={input.name}
    />
  );
};

const returnTextArea = (input: IFormElement) => {
  return (
    <TextArea
      value={input.value}
      placeholder={input.placeholder}
      autoSize={{ minRows: 5, maxRows: 6 }}
    />
  );
};

const renderFileInput = (input: IFormElement) => {
  return (
    <Upload beforeUpload={() => false} accept="image/*">
      <Button className="cancel-button mb-5" icon={<InboxOutlined />}>
        {input.placeholder}
      </Button>
    </Upload>
  );
};

const renderSelect = (input: IFormElement) => {
  return (
    <Select
      className="w-full"
      style={{ width: 120 }}
      defaultValue={input.value}
      mode={input.isMultipleSelect ? 'multiple' : 'tags'}
      options={input.options}
    />
  );
};

export const renderInputField = (input: IFormElement) => {
  switch (input.type) {
    case 'text':
      return returnInput(input);

    case 'textarea':
      return returnTextArea(input);

    case 'password':
      return returnInput(input);

    case 'select':
      return renderSelect(input);

    case 'file':
      return renderFileInput(input);

    default:
      return null;
  }
};
