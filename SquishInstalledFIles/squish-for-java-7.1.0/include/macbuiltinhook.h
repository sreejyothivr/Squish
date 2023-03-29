/**********************************************************************
** Copyright (C) 2009 - 2021 froglogic GmbH.
** Copyright (C) 2022 The Qt Company Ltd.
** All rights reserved.
**
** This file is part of Squish.
**
** Licensees holding a valid Squish License Agreement may use this
** file in accordance with the Squish License Agreement provided with
** the Software.
**
** This file is provided AS IS with NO WARRANTY OF ANY KIND, INCLUDING THE
** WARRANTY OF DESIGN, MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.
**
** See the LICENSE file in the toplevel directory of this package.
**
** Contact contact@froglogic.com if any conditions of this licensing are
** not clear to you.
**
**********************************************************************/
#ifndef MACBUILTINHOOK_H
#define MACBUILTINHOOK_H

#include <TargetConditionals.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <dlfcn.h>

#if defined(TARGET_OS_IPHONE) && TARGET_OS_IPHONE && !TARGET_IPHONE_SIMULATOR

/* iPhone app for the device

   We can't simply test for "#if !TARGET_IPHONE_SIMULATOR" since we also
   have to support Tiger where there are no TARGET_OS_IPHONE and
   TARGET_IPHONE_SIMULATOR defines.
*/
#  ifdef __cplusplus
    extern "C" {
#  endif
    extern bool squish_allowAttaching(unsigned short port);
#  ifdef __cplusplus
    }
#  endif

#else

static bool squish_installBuiltinHook()
{
    const char* prefix = NULL;
    char* dylibName = NULL;
    char* wrapperLib = NULL;

#  if defined(TARGET_OS_IPHONE) && TARGET_OS_IPHONE && TARGET_IPHONE_SIMULATOR
    /* iPhone app for the simulator */
    prefix = getenv("SQUISH_PREFIX");
    dylibName = "/lib/libsquishiospre.dylib";
#  else
    /* Mac app */
    prefix = getenv("SQUISH_PREFIX");
    dylibName = "/lib/libsquishmacpre.dylib";
#  endif

    if (!prefix)
        return false;
    if (!dylibName)
        return false;

    wrapperLib = (char*)malloc(strlen(prefix) + strlen(dylibName) + 1);
    strcpy(wrapperLib, prefix);
    strcat(wrapperLib, dylibName);
    return (dlopen(wrapperLib, 0) != NULL);
}

static bool squish_allowAttaching(unsigned short port)
{
    char portString[6]; /* maximum port number is 65535 */

    snprintf(portString, sizeof(portString), "%d", port);
    setenv("SQUISH_ATTACHABLE_PORT", portString, 1);
    return squish_installBuiltinHook();
}

#endif

#endif /* MACBUILTINHOOK_H */
