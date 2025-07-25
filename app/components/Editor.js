'use client'

import React, {useEffect, useRef, useState} from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import {SendOutlined} from "@ant-design/icons";

const Editor = ({isShowSendButton = true, onClickSendButton, onChange}) => {
    const [value, setValue] = useState(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (value.trim()) {
                const styledValue = value.replace(/<img /g, '<img style="max-width:200px;height:auto;" ');
                const newValue = styledValue.replace('<p><br></p>', '');
                onClickSendButton(newValue);
                setValue(null);
            }
        }
    };

    useEffect(() => {
        const quill = document.querySelector('.ql-editor');
        if (quill) {
            quill.style.color = 'black';
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const images = document.querySelectorAll('.ql-editor img');
            images.forEach(img => {
                img.style.maxWidth = '200px';
                img.style.height = 'auto';
            });
        }
    }, [value]);

    return (<div className="editorStyle">
        <ReactQuill
            className="editorField"
            theme="snow"
            value={value}
            placeholder="Add Comment..."
            onChange={(value) => {
                // const images = document.querySelectorAll('.ql-editor img');
                // images.forEach(img => {
                //     img.style.maxWidth = '200px';
                //     img.style.height = 'auto';
                // });

                setValue(value);
                if (onChange) onChange(value);
            }}
            modules={{
                toolbar: [
                    // [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                    [{size: []}],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'},
                        // {'indent': '-1'}, {'indent': '+1'}
                    ],
                    ['link', 'image', 'video'],
                    // ['clean']
                ],
                clipboard: {
                    matchVisual: false,
                }
            }}
            onKeyDown={handleKeyDown}
        />
        {isShowSendButton ? <div className="messageSendButton" onClick={() => {
            if(value) {
                const styledValue = value.replace(/<img /g, '<img style="max-width:200px;height:auto;" ');
                onClickSendButton(styledValue);
                setValue(null);
            }
        }}>
            <SendOutlined />
        </div> : null}
    </div>);
};

export default Editor;