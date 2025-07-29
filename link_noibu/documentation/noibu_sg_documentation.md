
# NOIBU SG Documentation

**Version 25.1.0 for year 2025**

---

## Table of Contents

1. [Summary](#summary)  
2. [Component Overview](#component-overview)  
    2.1 [Functional Overview](#functional-overview)  
    2.2 [Use Cases](#use-cases)  
    2.3 [Compatibility](#compatibility)  
    2.4 [Privacy, Payment](#privacy-payment)  
    2.5 [Limitations, Constraints](#limitations-constraints)  
3. [Implementation Guide](#implementation-guide)  
    3.1 [Setup](#setup)  
    3.2 [Configuration](#configuration)  
        - 3.2.1 [Installing the cartridge(s)](#installing-the-cartridges)  
    3.3 [Custom Code](#custom-code)  
4. [Operations, Maintenance](#operations-maintenance)  
    4.1 [Failure/Recovery Process](#failurerecovery-process)  
    4.2 [Support](#support)  
5. [Known Issues/Caveats](#known-issuescaveats)  
6. [Release History](#release-history)

---

## Summary

This document provides the guidelines for the implementation of the Noibu SiteGenesis (SG) enabled cartridge to Salesforce Commerce Cloud (SFCC).

It describes how the Noibu cartridge works.

---

## Component Overview

### Functional Overview

This cartridge is designed to facilitate integration with Noibu for session tracking and management. Its primary functionality revolves around sending the session ID to Noibu for enhanced session monitoring and analysis. This integration ensures that Noibu can effectively capture and process user interactions, enabling detailed insights into the customer journey.

Additionally, this cartridge is built to streamline processes while maintaining compatibility with Noibu's analytics ecosystem. Although the focus is currently limited to session ID tracking, the architecture supports potential future enhancements, such as capturing additional user metadata or interaction events.

---

### Use Cases

* Session ID tracking for user monitoring.
* Compatibility with Noibu analytics.
* Foundation for future metadata capture.

---

### Compatibility

* Compatibility mode: **104.0.1**

---

### Privacy, Payment

* There are currently **no privacy or payment issues**.

---

### Limitations, Constraints

* There are **no known limitations or constraints**.

---

## Implementation Guide

### Setup

The following Noibu Integration tasks are included within the LINK Cartridge:

- Installation of the cartridge  
- Import custom metadata  
- Set the newly-created metadata values (Site Preferences)

---

### Configuration

#### Installing the cartridge(s)

1. Import the `link_noibu` cartridge into the Commerce Cloud Studio Workspace:
    - Open Commerce Cloud Studio
    - Click **File** → **Import** → **General** → **Existing Projects Into Workspace**
    - Browse to the `link_noibu` directory
    - Click **Finish**
    - Click **OK** when prompted to link the cartridge to the sandbox

2. Assign the cartridge to a site:
    - Log into **Business Manager**
    - Click **Administration** → **Sites** → **Manage Sites** → *SiteGenesis* or the required site
    - Select the **Settings** tab
    - Add `int_noibu:int_noibu_sg_changes` to the beginning of your cartridge path
    - Click **Apply**

3. Activate desired code version:
    - Click **Administration** → **Site Development** → **Code Deployment**
    - If a different code version is active, switch and click **Activate**

---

### Configure Noibu Preferences

In Business Manager, navigate to:

**Site** → **Site Preferences** → **Custom Preferences**

A custom site preference group with the ID `noibuConfigurations` is available. Select it and edit the attributes accordingly.

**Preference Name:** Noibu Enabled  
**Description:** Enabling Noibu will allow the cartridge functionality to proceed.

---

### Custom Code

The `int_noibu_sg_changes` cartridge includes example template changes to integrate Noibu functionality. These changes work with a default SG installation but may need to be merged into your custom cartridges.

Refer to the following:

- `int_noibu_sg_changes/cartridge/templates/default/components/header/htmlhead.isml`: Override highlighted snippet into your overridden `htmlHead.isml` in `app_storefront_core`
- `int_noibu/cartridge/scripts/hooks/htmlHead.js`: Extension of the `htmlHead` hook
- `link_noibu/cartridges/int_noibu/cartridge/templates/default/noibu/include/noibuInclude.isml` (line 4): Set a data attribute
- `link_noibu/cartridges/int_noibu/cartridge/client/default/js/noibu.js` (line 23): Get the initialized data attribute
- `link_noibu/cartridges/int_noibu/cartridge/client/default/js/noibu.js` (line 30): Send the custom attribute to Noibu — contact Noibu to sync this into the system

---

## Operations, Maintenance

### Failure/Recovery Process

If the cartridge fails, it **will not affect storefront functionality**. The storefront will continue to operate normally.

---

### Support

For post-live support, contact Noibu:  
📧 **support@noibu.com**

---

## Known Issues/Caveats

There are **no known issues**.

---

## Release History

| Version | Date |
|---------|------|
| 25.1.0  | 2025 |
