import { VscItalic } from "react-icons/vsc";
import { PiTextBBold } from "react-icons/pi";
import { FaListUl, FaListOl } from "react-icons/fa";
import { BsImageFill } from "react-icons/bs";

const ToolBar = ({ editor }) => {
  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  return (
    <div className="menu-bar">
      <div className="menu-bar-box">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          <PiTextBBold />
        </button>

        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          <VscItalic />
        </button>

        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>
          U
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <FaListUl />
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <FaListOl />
        </button>

        <button onClick={addImage}>
          <BsImageFill />
        </button>

        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          HR
        </button>

        {/* Font Size Select */}
        <div className="font-size-wrapper">
          <select
            onChange={(e) =>
              editor.chain().focus().setFontSize(e.target.value).run()
            }
          >
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="24px">24</option>
          </select>
        </div>
      </div>

      <button className="primary-btn">
            Create Article
            </button>
    </div>
  );
};

export default ToolBar;
